// start config
float degreesPerMin = 180f;
float increment = 0.5f;
// end config

List<IMyTerminalBlock> upPistons = new List<IMyTerminalBlock>();
List<IMyTerminalBlock> downPistons = new List<IMyTerminalBlock>();
List<IMyTerminalBlock> horizPistons = new List<IMyTerminalBlock>();
IMyMotorStator rotor;
IMyShipDrill drill;

public Program()
{
	Runtime.UpdateFrequency = UpdateFrequency.Update100;
	GridTerminalSystem.GetBlockGroupWithName("Up Pistons").GetBlocks(upPistons);
	GridTerminalSystem.GetBlockGroupWithName("Down Pistons").GetBlocks(downPistons);
	GridTerminalSystem.GetBlockGroupWithName("Horizontal Pistons").GetBlocks(horizPistons);
	rotor = GridTerminalSystem.GetBlockWithName("Rotor") as IMyMotorStator;
	rotor.TargetVelocityRad = degreesPerMin / 60 / 180 * (float) Math.PI;
	drill = GridTerminalSystem.GetBlockWithName("Drill") as IMyShipDrill;
	drill.Enabled = true;
	
	// reset everything
	foreach(IMyPistonBase piston in upPistons) {
		piston.MaxLimit = piston.MinLimit = 10f;
		piston.Velocity = 0.5f;
	}
	foreach(IMyPistonBase piston in downPistons) {
		piston.MaxLimit = piston.MinLimit = 0f;
		piston.Velocity = -0.5f;
	}
	foreach(IMyPistonBase piston in horizPistons) {
		piston.MaxLimit = piston.MinLimit = 0f;
		piston.Velocity = -0.5f;
	}
	
	maxHorizIncrements = (int) Math.Floor(10f / increment * horizPistons.Capacity);
	maxUpIncrements = (int) Math.Floor(10f / increment * upPistons.Capacity);
	maxDownIncrements = (int) Math.Floor(10f / increment * downPistons.Capacity);
}

public void modifyPistonLimit(List<IMyTerminalBlock> pistons, float amount) {
	foreach (IMyPistonBase piston in pistons) {
		float velocity = piston.CurrentPosition < piston.MaxLimit + amount ? 0.5f : -0.5f;
		piston.MaxLimit += amount / pistons.Capacity;
		piston.MinLimit = piston.MaxLimit;
		piston.Velocity = velocity;
	}
}

public bool arePistonsReset() {
	foreach (IMyPistonBase piston in upPistons) {
		if (piston.CurrentPosition != 10f) return false;
	}
	foreach (IMyPistonBase piston in downPistons) {
		if (piston.CurrentPosition != 0f) return false;
	}
	foreach (IMyPistonBase piston in horizPistons) {
		if (piston.CurrentPosition != 0f) return false;
	}
	return true;
}

bool readying = true;
bool outwards = true;
int horizIncrement = 0;
int upIncrement = 0;
int downIncrement = 0;
int maxHorizIncrements;
int maxUpIncrements;
int maxDownIncrements;
float lastAngle = 0f;

public void Main(string argument, UpdateType updateSource)
{
	if (readying) {
		Echo("Busy resetting pistons");
		readying = !arePistonsReset();
		return;
	}

	Echo($"Angle: {lastAngle}\nOutwards: {outwards}\nhInc: {horizIncrement}/{maxHorizIncrements}\nuInc: {upIncrement}/{maxUpIncrements}\ndInc: {downIncrement}/{maxDownIncrements}");
	if (rotor.Angle < lastAngle) {
		if (horizIncrement < maxHorizIncrements) {
			modifyPistonLimit(horizPistons, outwards ? increment : -increment);
			horizIncrement++;
		} else {
			horizIncrement = 0;
			if (upIncrement < maxUpIncrements) {
				modifyPistonLimit(upPistons, -increment);
				upIncrement++;
			} else if (downIncrement < maxDownIncrements) {
				modifyPistonLimit(downPistons, increment);
				downIncrement++;
			}
			outwards = !outwards;
		}
	}
	lastAngle = rotor.Angle;
}
