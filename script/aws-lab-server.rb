#!/usr/bin/env ruby
require 'fog'
require 'json'
require 'socket'
require 'resolv'

class AwsLabServer

  attr_reader :options, :name, :target, :pem, :pem_path, :compute, :dns, :zone

  AMI               = CONFIG[:deploy][:ami]
  EC2_FLAVOR        = CONFIG[:deploy][:ec2_flavor]
  PEM_NAME          = CONFIG[:deploy][:pem][:name]
  PEM_PATH          = CONFIG[:deploy][:pem][:path]
  GROUP_NAME        = CONFIG[:deploy][:group_name]
  ZONE_DOMAIN       = CONFIG[:deploy][:zone_domain]
  ZONE_RECORDS_NAME = CONFIG[:deploy][:zone_records_name]

  SERVER_FORMAT_STR = "  %-20s%-30s%-14s%-20s%-16s%-30s"

  def initialize(options={})
    @options = {
      :verbose => true,
      :littlechef_path => File.join(CONFIG_PATH, 'lab-littlechef'),
      :pem => { :name => PEM_NAME, :path => PEM_PATH },
      :server => {
        :image_id => AMI,
        :flavor_id => EC2_FLAVOR,
        :groups => [GROUP_NAME],
        :tags => { "Name" => options[:name] }
      }
    }
    @options.merge!(options)
    @name = @options[:name]
    @pem = @options[:pem][:name]
    @pem_path = File.join(@options[:pem][:path], @pem + '.pem')
    @options[:server].merge!(:key_name =>  @pem)
    begin
      @compute = ::Fog::Compute.new({ :provider => 'AWS'})
    rescue ArgumentError => e
      if e.message[/aws_access_key_id/]
        msg = <<-HEREDOC

*** #{e.message}
*** Create the file ~/.fog with your Amazon Web Services API Access Keys

file: ~/.fog
:default:
  :aws_access_key_id: YOUR_AWS_ACCESS_KEY
  :aws_secret_access_key: YOUR_AWS_SECRET_ACCESS_KEY

        HEREDOC
        raise msg
      else
        raise
      end
    end
    @dns = ::Fog::DNS.new({ :provider => 'AWS' })
    @zone = @dns.zones.find { |z| z.domain == ZONE_DOMAIN }
  end

  def setup_ssh(hostname=false)
    if hostname
      hostnames = [hostname]
    else
      hostnames = CONFIG[:deploy][:targets].collect { |target| target[:url] }
    end
    hostnames.each do |host|
      @name = @options[:name] = host
      # unless we can already connect with ssh
      unless run_local_command("ssh ubuntu@#{@name} exit")
        # setup ssh communicatiopnb
        add_hostname_to_ssh_config
        erase_existing_host_key(@name)
        add_new_host_key
      end
    end
  end

  def list
    @lab_servers = @compute.servers.all('group-name' => GROUP_NAME).reject { |ls| ls.state == 'terminated' }
    @lab_servers.sort! { |a,b| a.state <=> b.state }
    @records = @zone.records.all!
    puts
    puts sprintf(SERVER_FORMAT_STR, "target", "hostname", "state", "ipaddress", "ec2-id", "ec2-dns")
    puts "-" * 150
    result = @lab_servers.collect { |ls|
      dnsrecord = @records.find { |r| r.value[0] == ls.public_ip_address }
      if dnsrecord
        external_dns = dnsrecord.name
        target = find_target(external_dns.gsub(/\.$/, ""))
      else
        external_dns = "missing"
        target = { :name => "missing", :path => "missing" }
      end
      if target
        sprintf(SERVER_FORMAT_STR, target[:name], external_dns, ls.state, ls.public_ip_address, ls.id, ls.dns_name)
      else
        sprintf(SERVER_FORMAT_STR, "missing", external_dns, ls.state, ls.public_ip_address, ls.id, ls.dns_name)
      end
    }
    puts result.join("\n")
    puts
  end

  def create(hostname)
    @name = @options[:name] = hostname
    @target = check_for_target(@name)
    @options[:server][:tags]["Name"] = @name
    if @target[:ec2_flavor]
      @options[:server][:flavor_id] = @target[:ec2_flavor]
    end
    puts "\n*** creating new server: #{@name}" if @options[:verbose]
    @server = @compute.servers.create(@options[:server])
    puts "\n*** waiting for server: #{@server.id} to be ready ..." if @options[:verbose]
    @server.wait_for { ready? }
    @server.reload
    @ipaddress = aquire_elastic_ip_address
    puts "\n*** associating server: #{@server.id}, #{@server.dns_name} with ipaddress: #{@ipaddress}"  if @options[:verbose]
    @compute.associate_address(@server.id, @ipaddress)
    if find_dns_record(@name)
      update_dns_record(@name, @ipaddress)
    else
      new_dns_record(@name, @ipaddress)
    end
    erase_existing_host_key(@name)
    erase_existing_host_key(@ipaddress)
    add_hostname_to_ssh_config
    add_new_host_key
    write_littlechef_node
    update_littlechef_node
    new_server_prologue(hostname)
  end

  def delete(hostname)
    @name = hostname
    @target = check_for_target(@name)
    @ipaddress = IPSocket::getaddress(@name)
    @server = @compute.servers.all({ 'ip-address' => @ipaddress }).first
    if @server
      puts "\n*** terminating server: #{@server.id}, #{@server.dns_name}"  if @options[:verbose]
      @server.destroy
      erase_existing_host_key(@ipaddress)
      erase_existing_host_key(@name)
    end
  end

  def recreate(hostname)
    @name = @options[:name] = hostname
    @target = check_for_target(@name)
    @options[:server][:tags]["Name"] = @name
    self.delete(@name)
    puts "\n*** re-creating server: #{@name}" if @options[:verbose]
    @server = @compute.servers.create(@options[:server])
    puts "\n*** waiting for server: #{@server.id} to be ready ..." if @options[:verbose]
    @server.wait_for { ready? }
    @server.reload
    puts "\n*** associating server: #{@server.id}, #{@server.dns_name} with ipaddress: #{@ipaddress}"  if @options[:verbose]
    @compute.associate_address(@server.id, @ipaddress)
    erase_existing_host_key(@name)
    erase_existing_host_key(@ipaddress)
    add_new_host_key
    write_littlechef_node
    update_littlechef_node
    new_server_prologue(hostname)
  end

  def new_server_prologue(host)
    hostname = host.gsub(/\.$/, "")
    target = find_target(hostname)
    if @options[:verbose]
      puts <<-HEREDOC

If the new server provisioning with littlechef was successful login to the server
with ssh and update the server hostname settings in config/config.yml:

    ssh deploy@#{hostname}

If you wish to support the integration of the optional signed Java resources
for external users:

  - legacy Molecular Worbench and Energy2D Java Web Start applications
  - Java-based Vernier GoIO browser-sensor applet integration

Put a copy of a valid Java siging certificate keystore
on #{target[:name]} and edit 'config/config.yml' to reference this
keystore before running cap #{target[:name]} deploy:setup

The keystore supplied with the repository is a sample self-signed certificate
and end users will be warned that it is not valid.

After finishing any further configuration of the server run the cap task
deploy:setup to finish deploying the application code and seting up #{@name}.

    cap #{target[:name]} deploy:setup

      HEREDOC
    end
  end

  # Call with hostname or ec2 instance-id
  def update(reference)
    @name = @options[:name] = reference
    @options[:server][:tags]["Name"] = @name
    @ipaddress = IPSocket::getaddress(@name)
    @server = @compute.servers.all({ 'ip-address' => @ipaddress }).first
    begin
      @server = @compute.servers.get(reference) unless @server
    rescue Fog::Compute::AWS::Error
    end
    if @server
      if @server.state == "running"
        puts "\n*** updating server: #{@server.id}, #{@server.dns_name} provisioning with littlechef 'lab-server' role" if @options[:verbose]
        update_littlechef_node
      else
        puts "\n*** server not running: #{@server.id}, #{@server.dns_name}" if @options[:verbose]
      end
    else
      puts "\n*** can't locate: #{reference}" if @options[:verbose]
    end
  end

  # Call with hostname or ec2 instance-id
  def stop(reference)
    @name = @options[:name] = reference
    @options[:server][:tags]["Name"] = @name
    @ipaddress = IPSocket::getaddress(@name)
    @server = @compute.servers.all({ 'ip-address' => @ipaddress }).first
    begin
      @server = @compute.servers.get(reference) unless @server
    rescue Fog::Compute::AWS::Error
    end
    if @server
      if @server.state == "running"
        puts "\n*** stopping server: #{@server.id}, #{@server.dns_name}" if @options[:verbose]
        @server.stop
      else
        puts "\n*** server not running: #{@server.id}, #{@server.dns_name}" if @options[:verbose]
      end
    else
      puts "\n*** can't locate: #{reference}" if @options[:verbose]
    end
  end

  def start(ec2_id)
    @server = @compute.servers.get(ec2_id)
    if @server
      case @server.state
      when "stopped"
        puts "\n*** starting server: #{@server.id}" if @options[:verbose]
        @server.start
      when "running"
        puts "\n*** server: #{@server.id} already running" if @options[:verbose]
      else
        puts "\n*** server: #{@server.id} in in state: #{@server.state}" if @options[:verbose]
      end
    end
  end

  # Add the new hostname to the local .ssh/config referencing a local copy
  # of lab-key.pem so you can ssh into the server
  def add_hostname_to_ssh_config
    cmd = <<-HEREDOC
echo '
Host #{@name}
  User ubuntu
  IdentityFile #{@pem_path}
' >> ~/.ssh/config
    HEREDOC
    run_local_command(cmd)
  end

  # Erase any existing RSA host key in your local ~/.ssh/known_hosts
  def erase_existing_host_key(key)
    run_local_command("ssh-keygen -R #{key}")
  end

  # Connect once with StrictHostKeyChecking off to add the new host key
  def add_new_host_key
    run_local_command("ssh ubuntu@#{name} -o StrictHostKeyChecking=no exit")
  end

  def run_local_command(cmd)
    puts "\n*** running local command: #{cmd}" if @options[:verbose]
    system(cmd)
  end

  # Create a new dns record for the server and point it to the public IP address
  def new_dns_record(name, ipaddress, ttl=60)
    puts "\n*** Creating new Type A DNS record: #{@name} => #{@ipaddress}, ttl => #{ttl}" if @options[:verbose]
    @dnsrecord = @zone.records.create({ :value => ipaddress, :name => name, :ttl => ttl, :type => 'A' })
  end

  # find dns record for the hostname
  def find_dns_record(hostname)
    @dnsrecord = @zone.records.get(hostname)
  end

  # update ipaddress for dns record: hostname
  def update_dns_record(hostname, ipaddress)
    if record = find_dns_record(hostname)
      puts "\n*** Updating IP address for DNS record: #{record.name} from #{record.value} => #{ipaddress}" if @options[:verbose]
      record.modify(:value => [ipaddress])
      @dnsrecord = record
    else
      puts "\n*** DNS record: #{hostname} not found" if @options[:verbose]
    end
  end

  def aquire_elastic_ip_address
    # either use an available elastic IP address or create a new one
    available_addresses = @compute.addresses.all({"instance-id" => ""})
    if available_addresses.empty?
      # Allocate a new elastic ip
      elasticip = @compute.allocate_address
      # TODO: check this -- which only happens when no elastic ips are available
      ipaddress = elasticip.body["publicIp"]
    else
      # else use an available one
      ipaddress = available_addresses.last.public_ip
    end
    return ipaddress
  end

  def find_target(url)
    CONFIG[:deploy][:targets].find { |t| t[:url] == url }
  end

  def check_for_target(url)
    unless target = find_target(url)
      puts <<-HEREDOC

*** A target does not yet exist for #{url}.
*** Please add a new deploy target for #{url} to config/config.yml before continuing.

      HEREDOC
      raise "No deploy target defined for #{url}."
    end
    return target
  end


  def setup_littlechef_nodes
    @lab_servers = @compute.servers.all('group-name' => GROUP_NAME).find_all { |ls| ls.state == 'running' }
    targets = CONFIG[:deploy][:targets]
    targets.each { |t| t[:ipaddress] = Resolv.getaddress(t[:url]) }
    @lab_servers.each do |ls|
      target = targets.find { |t| t[:ipaddress] == ls.public_ip_address }
      if target
        @name = target[:url]
        @ipaddress = target[:ipaddress]
        write_littlechef_node
      end
    end
  end

  def write_littlechef_node
    @node = {
      "ipaddress"    => @ipaddress,
      "lab-hostname" => @name,
      "run_list"     => [ "role[lab-server]" ]
    }
    @json_node = JSON.pretty_generate(@node)
    # write this to the nodes/ directory in the littlechef-server repository
    node_name = "#{@name}.json"
    puts "\n*** updating littlechef node: #{node_name}" if @options[:verbose]
    littlechef_nodes_path = File.join(@options[:littlechef_path], 'nodes')
    FileUtils.mkdir_p littlechef_nodes_path
    File.open(File.join(littlechef_nodes_path, node_name), 'w') { |f| f.write @json_node }
  end

  def update_littlechef_node
    cmd = "cd #{@options[:littlechef_path]} && fix node:#{name} role:lab-server"
    attempts = 1
    if @options[:verbose]
      puts <<-HEREDOC

*** provisioning #{@name} with littlechef role: lab-server
    #{@server.id}, #{@server.dns_name}, #{@ipaddress}
    command: #{cmd}

      HEREDOC
    end
    success = system(cmd)
    if !success
      while attempts < 10
        attempts += 1
        delay = attempts * 10
        puts <<-HEREDOC

*** #{attempts} attempts: trying again in #{delay}s (maximum 10 tries)

        HEREDOC
        sleep(delay)
        success = system(cmd)
        break if success
      end
    end
  end

  def setup_capistrano_deploy_scripts
    targets = CONFIG[:deploy][:targets]
    targets.each do |target|
      @name = target[:url]
      write_capistrano_deploy_script
    end
  end

  def write_capistrano_deploy_script
    target = find_target(@name)
    deploy_script_name = "#{target[:name]}.rb"
    deploy_scripts_path = File.join(CONFIG_PATH, 'deploy')
    FileUtils.mkdir_p deploy_scripts_path
    deploy_script_path = File.join(deploy_scripts_path, deploy_script_name)
    puts "\n*** updating capistrano deploy script: #{deploy_script_path}" if @options[:verbose]
    deploy_script_content = <<-HEREDOC
server "#{@name}", :app, :primary => true
set :branch, "#{target[:branch]}"
    HEREDOC
    File.open(deploy_script_path, 'w') { |f| f.write deploy_script_content }
  end

end
