public Program()
{
	Runtime.UpdateFrequency = UpdateFrequency.Update100;
	GridTerminalSystem.GetBlockGroupWithName("Storage").GetBlocks(storage);
	connector = GridTerminalSystem.GetBlockWithName("Connector") as IMyShipConnector;
}

List<IMyTerminalBlock> storage = new List<IMyTerminalBlock>();
IMyShipConnector connector;

public bool isStorageFull() {
	foreach (IMyCargoContainer cargo in storage) {
		if (!cargo.GetInventory().IsFull) return false;
	}
	return true;
}

public void Main(string argument, UpdateType updateSource)
{
	if (isStorageFull()) {
		connector.ThrowOut = connector.GetInventory().IsFull;
	}
}
