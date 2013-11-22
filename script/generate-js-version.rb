#!/usr/bin/env ruby
require_relative 'setup.rb'
require "erb"

ENCODING_OPTIONS = {
    :invalid           => :replace,  # Replace invalid byte sequences
    :undef             => :replace,  # Replace anything not defined in ASCII
    :replace           => ''        # Use a blank for those replacements
    # :universal_newline => true doesn't work in Ruby 1.9.3-p194
}

def cleanup_string(str)
  clean = str.encode Encoding.find('ASCII'), ENCODING_OPTIONS
  clean.gsub("\r", "\\n")
end

JS_VERSION_PATH = File.join(SRC_LAB_PATH, 'lab.version.js')

def dirty?
  !system("git diff --exit-code --quiet")
end

def unpushed?
  !system("git diff --cached --exit-code --quiet")
end

commit_sha = `git log -1 --pretty="%H"`.strip
commit_short_sha = `git log -1 --pretty="%h"`.strip
commit_author = `git log -1 --pretty="%an"`.strip
commit_author_email = `git log -1 --pretty="%ae"`.strip
commit_author_date = `git log -1 --pretty="%ar"`.strip
commit_short_message = `git log -1 --pretty="%s"`.strip
commit_message = `git log -1 --pretty="%B"`.strip

branch_name = `git rev-parse --abbrev-ref HEAD`.strip
# => "master"

remote_branch = `git rev-parse --symbolic-full-name --abbrev-ref #{branch_name}@{u}`.strip
# => "origin/master"

remote_url = `git config --get remote.origin.url`.strip
# => "git@github.com:labframework/lab.git"

github_project = remote_url[/.*:(.*?)\.git$/, 1]
# => "labframework/lab"

short_message = ERB::Util.html_escape(commit_short_message.gsub("\n", "\\n"))
message = ERB::Util.html_escape(commit_message.gsub("\n", "\\n"))

version = <<HEREDOC
// this file is generated during build process by: ./script/generate-js-version.rb
define(function (require) {
  return {
    "repo": {
      "branch": "#{branch_name}",
      "commit": {
        "sha":           "#{commit_sha}",
        "short_sha":     "#{commit_short_sha}",
        "url":           "https://github.com/#{github_project}/lab/commit/#{commit_short_sha}",
        "author":        "#{commit_author}",
        "email":         "#{commit_author_email}",
        "date":          "#{commit_author_date}",
        "short_message": "#{short_message}",
        "message":       "#{cleanup_string(message)}"
      },
      "dirty": #{dirty?}
    }
  };
});
HEREDOC
File.open(JS_VERSION_PATH, 'w') { |f| f.write version }
