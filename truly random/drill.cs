// start config
float degreesPerMin = 270f;
float increment = 1f;
int horizIncrement = 12;
int upIncrement = 3;
int downIncrement = 0;
// end config

List<IMyTerminalBlock> upPistons = new List<IMyTerminalBlock>();
List<IMyTerminalBlock> downPistons = new List<IMyTerminalBlock>();
List<IMyTerminalBlock> horizPistons = new List<IMyTerminalBlock>();
List<IMyTerminalBlock> storage = new List<IMyTerminalBlock>();

IMyMotorStator rotor;
IMyShipDrill drill;

public Program()
{
	Runtime.UpdateFrequency = UpdateFrequency.Update100;
	GridTerminalSystem.GetBlockGroupWithName("Up Pistons").GetBlocks(upPistons);
	GridTerminalSystem.GetBlockGroupWithName("Down Pistons").GetBlocks(downPistons);
	GridTerminalSystem.GetBlockGroupWithName("Horizontal Pistons").GetBlocks(horizPistons);
	GridTerminalSystem.GetBlockGroupWithName("Storage").GetBlocks(storage);
	rotor = GridTerminalSystem.GetBlockWithName("Rotor") as IMyMotorStator;
	rotor.TargetVelocityRad = degreesPerMin / 60 / 180 * (float) Math.PI;
	drill = GridTerminalSystem.GetBlockWithName("Drill") as IMyShipDrill;
	drill.Enabled = true;
	
	maxHorizIncrements = (int) Math.Floor(10f / increment * horizPistons.Capacity);
	maxUpIncrements = (int) Math.Floor(10f / increment * upPistons.Capacity);
	maxDownIncrements = (int) Math.Floor(10f / increment * downPistons.Capacity);
	outwards = (upIncrement + downIncrement) % 2 == 0;
	
	// reset everything
	targetUp = 10 - 10f / maxUpIncrements * upIncrement;
	foreach (IMyPistonBase piston in upPistons) {
		float velocity = piston.CurrentPosition < targetUp ? 0.5f : -0.5f;
		piston.MaxLimit = piston.MinLimit = targetUp;
		piston.Velocity = velocity;
	}
	targetDown = 10f / maxDownIncrements * downIncrement;
	foreach (IMyPistonBase piston in downPistons) {
		float velocity = piston.CurrentPosition < targetDown ? 0.5f : -0.5f;
		piston.MaxLimit = piston.MinLimit = targetDown;
		piston.Velocity = velocity;
	}
	float horizDiff = 10f / maxHorizIncrements * horizIncrement;
	targetHoriz = outwards ? horizDiff: 10 - horizDiff;
	foreach (IMyPistonBase piston in horizPistons) {
		float velocity = piston.CurrentPosition < targetHoriz ? 0.5f : -0.5f;
		piston.MaxLimit = piston.MinLimit = targetHoriz;
		piston.Velocity = velocity;
	}
	
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
		if (piston.CurrentPosition != targetUp) {
			Echo($"Waiting on up pistons: {piston.CurrentPosition} -> {targetDown}");
			return false;
		}
	}
	foreach (IMyPistonBase piston in downPistons) {
		if (piston.CurrentPosition != targetDown) {
			Echo($"Waiting on down pistons: {piston.CurrentPosition} -> {targetDown}");
			return false;
		}
	}
	foreach (IMyPistonBase piston in horizPistons) {
		if (piston.CurrentPosition != targetHoriz) {
			Echo($"Waiting on horizontal pistons: {piston.CurrentPosition} -> {targetHoriz}");
			return false;
		}
	}
	return true;
}

public bool isStorageFull() {
	foreach (IMyCargoContainer cargo in storage) {
		if (!cargo.GetInventory().IsFull) return false;
	}
	Echo("All cargo containers full, pausing!");
	return true;
}

bool readying = true;
float lastAngle = 0f;
bool outwards;
int maxHorizIncrements;
int maxUpIncrements;
int maxDownIncrements;
float targetUp;
float targetDown;
float targetHoriz;

public void Main(string argument, UpdateType updateSource)
{
	if (isStorageFull()) {
		return;
	}
	
	if (readying) {
		Echo($"Busy resetting pistons, {targetHoriz}, {targetUp}, {targetDown}");
		readying = !arePistonsReset();
		return;
	}

	Echo($"Angle: {lastAngle * 180 / Math.PI}\nOutwards: {outwards}\nhInc: {horizIncrement}/{maxHorizIncrements}\nuInc: {upIncrement}/{maxUpIncrements}\ndInc: {downIncrement}/{maxDownIncrements}");
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
