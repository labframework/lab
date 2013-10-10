Globals.init(5)
TurtlesOwn.init(3)
world = new World(-24, 24, -8, 22);
function SETUP () {
world.clearall()
SETUP_SLIDERS()
SETUP_WORLD()
Globals.setGlobal(2,12)
world.resetTicks()
};
function SETUP_SLIDERS () {
Globals.setGlobal(3,1)
Globals.setGlobal(4,0.6)
};
function SETUP_WORLD () {
Globals.setGlobal(0,(world.maxPycor - 5))
Globals.setGlobal(1,0)
AgentSet.ask(world.patches(), true, function(){ if ((AgentSet.getPatchVariable(1) > Globals.getGlobal(0))) {
AgentSet.setPatchVariable(2,Prims.scaleColor(9.9, AgentSet.getPatchVariable(1), 22, 15))
}
if (((AgentSet.getPatchVariable(1) <= Globals.getGlobal(0)) && (AgentSet.getPatchVariable(1) > Globals.getGlobal(1)))) {
AgentSet.setPatchVariable(2,Prims.scaleColor(105, AgentSet.getPatchVariable(1), -20, 20))
}
if ((AgentSet.getPatchVariable(1) < Globals.getGlobal(1))) {
AgentSet.setPatchVariable(2,(15 + 3))
}
if ((AgentSet.getPatchVariable(1) === Globals.getGlobal(1))) {
UPDATE_ALBEDO()
} });
};
function GO () {
AgentSet.ask(CLOUDS(), true, function(){ Prims.fd(AgentSet.getTurtleVariable(14)) });
RUN_SUNSHINE()
AgentSet.ask(AgentSet.agentFilter(world.patches(), function(){ return (AgentSet.getPatchVariable(1) === Globals.getGlobal(1)) }), true, function(){ UPDATE_ALBEDO() });
RUN_HEAT()
RUN_IR()
RUN_CO2()
world.tick()
};
function UPDATE_ALBEDO () {
AgentSet.setPatchVariable(2,Prims.scaleColor(55, Globals.getGlobal(4), 0, 1))
};
function ADD_CLOUD () {
var SKY_HEIGHT = (Globals.getGlobal(0) - Globals.getGlobal(1));
var Y = ((Globals.getGlobal(1) + Prims.randomfloat((SKY_HEIGHT - 4))) + 2);
var SPEED = (Prims.randomfloat(0.1) + 0.01);
var X = Prims.randomxcor();
var ID = 0;
if (AgentSet.any(CLOUDS())) {
ID = (Prims.max(AgentSet.of(CLOUDS(), function(){ return AgentSet.getTurtleVariable(15) })) + 1);
}
AgentSet.ask(world.createturtles((3 + Random.nextLong(20))), true, function(){ AgentSet.setTurtleVariable(13,"cloud")
AgentSet.setTurtleVariable(5,"cloud")
AgentSet.setTurtleVariable(14,SPEED)
AgentSet.setTurtleVariable(15,ID)
Prims.setxy(((X + Random.nextLong(9)) - 4), (Y + MY_RANDOM_NORMAL(2.5, 1)))
AgentSet.setTurtleVariable(1,9.9)
AgentSet.setTurtleVariable(10,(2 + Random.nextLong(2)))
AgentSet.setTurtleVariable(2,90) });
};
function REMOVE_CLOUD () {
if (AgentSet.any(CLOUDS())) {
var DOOMED_ID = AgentSet.oneOf(Prims.removeDuplicates(AgentSet.of(CLOUDS(), function(){ return AgentSet.getTurtleVariable(15) })));
AgentSet.ask(AgentSet.agentFilter(CLOUDS(), function(){ return (AgentSet.getTurtleVariable(15) === DOOMED_ID) }), true, function(){ AgentSet.die() });
}
};
function RUN_SUNSHINE () {
AgentSet.ask(RAYS(), true, function(){ if (!(MY_CAN_MOVE_P(0.3))) {
AgentSet.die()
} });
AgentSet.ask(RAYS(), true, function(){ Prims.fd(0.3) });
CREATE_SUNSHINE()
REFLECT_RAYS_FROM_CLOUDS()
ENCOUNTER_EARTH()
};
function CREATE_SUNSHINE () {
if (((10 * Globals.getGlobal(3)) > Random.nextLong(50))) {
AgentSet.ask(world.createturtles(1), true, function(){ AgentSet.setTurtleVariable(13,"ray")
AgentSet.setTurtleVariable(5,"ray")
AgentSet.setTurtleVariable(2,160)
AgentSet.setTurtleVariable(1,45)
Prims.setxy((Random.nextLong(10) + world.minPxcor), world.maxPycor) });
}
};
function REFLECT_RAYS_FROM_CLOUDS () {
AgentSet.ask(AgentSet.agentFilter(RAYS(), function(){ return AgentSet.any(CLOUDS_HERE()) }), true, function(){ AgentSet.setTurtleVariable(2,(180 - AgentSet.getTurtleVariable(2))) });
};
function ENCOUNTER_EARTH () {
AgentSet.ask(AgentSet.agentFilter(RAYS(), function(){ return (AgentSet.getTurtleVariable(4) <= Globals.getGlobal(1)) }), true, function(){ if (((100 * Globals.getGlobal(4)) > Random.nextLong(100))) {
AgentSet.setTurtleVariable(2,(180 - AgentSet.getTurtleVariable(2)))
} else {
Prims.right((Random.nextLong(45) - Random.nextLong(45)))
AgentSet.setTurtleVariable(1,((15 - 2) + Random.nextLong(4)))
AgentSet.setTurtleVariable(13,"heat")
AgentSet.setTurtleVariable(5,"dot")
} });
};
function RUN_HEAT () {
Globals.setGlobal(2,((0.99 * Globals.getGlobal(2)) + (0.01 * (12 + (0.1 * AgentSet.count(HEATS()))))))
AgentSet.ask(HEATS(), true, function(){ var DIST = (0.5 * Prims.randomfloat(1));
if (MY_CAN_MOVE_P(DIST)) {
Prims.fd(DIST)
} else {
AgentSet.setTurtleVariable(2,(180 - AgentSet.getTurtleVariable(2)))
}
if ((AgentSet.getTurtleVariable(4) >= Globals.getGlobal(1))) {
if ((((Globals.getGlobal(2) > (20 + Random.nextLong(40))) && (AgentSet.getTurtleVariable(3) > 0)) && (AgentSet.getTurtleVariable(3) < (world.maxPxcor - 8)))) {
AgentSet.setTurtleVariable(13,"IR")
AgentSet.setTurtleVariable(5,"ray")
AgentSet.setTurtleVariable(2,20)
AgentSet.setTurtleVariable(1,125)
} else {
AgentSet.setTurtleVariable(2,(100 + Random.nextLong(160)))
}
} });
};
function RUN_IR () {
AgentSet.ask(IRS(), true, function(){ if (!(MY_CAN_MOVE_P(0.3))) {
AgentSet.die()
} });
AgentSet.ask(IRS(), true, function(){ Prims.fd(0.3)
if ((AgentSet.getTurtleVariable(4) <= Globals.getGlobal(1))) {
AgentSet.setTurtleVariable(13,"heat")
AgentSet.setTurtleVariable(5,"dot")
Prims.right(Random.nextLong(45))
Prims.left(Random.nextLong(45))
AgentSet.setTurtleVariable(1,((15 - 2) + Random.nextLong(4)))
}
if (AgentSet.any(CO2S_HERE())) {
AgentSet.setTurtleVariable(2,(180 - AgentSet.getTurtleVariable(2)))
} });
};
function ADD_CO2 () {
var SKY_HEIGHT = (Globals.getGlobal(0) - Globals.getGlobal(1));
AgentSet.ask(world.createturtles(25), true, function(){ AgentSet.setTurtleVariable(13,"CO2")
AgentSet.setTurtleVariable(5,"CO2-molecule")
AgentSet.setTurtleVariable(1,55)
Prims.setxy(Prims.randomxcor(), (Globals.getGlobal(1) + Prims.randomfloat(SKY_HEIGHT))) });
};
function REMOVE_CO2 () {
for(var i = 0; i < 25; i++) { if (AgentSet.any(CO2S())) {
AgentSet.ask(AgentSet.oneOf(CO2S()), true, function(){ AgentSet.die() });
} }
};
function RUN_CO2 () {
AgentSet.ask(CO2S(), true, function(){ Prims.right((Random.nextLong(51) - 25))
var DIST = (0.05 + Prims.randomfloat(0.1));
if (AgentSet.of(AgentSet.self().patchAhead(DIST), function(){ return !(Prims.shadeOf(105, AgentSet.getPatchVariable(2))) })) {
AgentSet.setTurtleVariable(2,(180 - AgentSet.getTurtleVariable(2)))
}
Prims.fd(DIST) });
};
function CO2S () {
return AgentSet.agentFilter(world.turtles(), function(){ return (AgentSet.getTurtleVariable(13) === "CO2") });
};
function CO2S_HERE () {
return AgentSet.agentFilter(AgentSet.self().turtlesHere(), function(){ return (AgentSet.getTurtleVariable(13) === "CO2") });
};
function CLOUDS () {
return AgentSet.agentFilter(world.turtles(), function(){ return (AgentSet.getTurtleVariable(13) === "cloud") });
};
function CLOUDS_HERE () {
return AgentSet.agentFilter(AgentSet.self().turtlesHere(), function(){ return (AgentSet.getTurtleVariable(13) === "cloud") });
};
function RAYS () {
return AgentSet.agentFilter(world.turtles(), function(){ return (AgentSet.getTurtleVariable(13) === "ray") });
};
function HEATS () {
return AgentSet.agentFilter(world.turtles(), function(){ return (AgentSet.getTurtleVariable(13) === "heat") });
};
function IRS () {
return AgentSet.agentFilter(world.turtles(), function(){ return (AgentSet.getTurtleVariable(13) === "IR") });
};
function MY_CAN_MOVE_P (AMOUNT) {
var NEW_Y = (AgentSet.getTurtleVariable(4) + (AMOUNT * Trig.unsquashedCos(AgentSet.getTurtleVariable(2))));
if ((AgentSet.getTurtleVariable(4) > 0)) {
return (NEW_Y < (world.maxPycor + 0.5));
} else {
return (NEW_Y >= (world.minPycor - 0.5));
}
};
function MY_RANDOM_NORMAL (CENTER, SDEV) {
return ((CENTER - Prims.randomfloat(SDEV)) + Prims.randomfloat(SDEV));
};