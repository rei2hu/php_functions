--[[
	credits to Nodus Cursorius#4383 for original source
]]--

local magicNumber = 0x4EC66718
local versionNumber = 0x14

local extract
local fileName
local help
local list
local output
local quiet
local verbose

for k,v in ipairs(arg) do
	if not fileName then fileName = string.match(v, ".*toc") end
	if v == "-x" then extract = true end
	if v == "-h" then help = true end
	if v == "-l" then list = true end
	if v == "-o" then output = true end
	if v == "-q" then quiet = true end
	if v == "-v" then verbose = true end
end

if help then
	print("Warframe Extractor 0.1 - Parse .toc files for listing or extraction.\n")
	print("  -l\tList")
	print("  -x\tExtract\t\t(lists by default, use -q to suppress)\n")
	print("  -h\tHelp")
	print("  -q\tWhen extracting, do so quietly and suppress the list output")
	print("  -v\tVerbose header information on listing and extraction\n")
	print("  Examples:")
	print("    List all .lua files within B.Font.toc")
	print("  \twextract -l *.lua B.Font.toc\n")
	print("    Extract all .wav files from B.Misc_en.toc to \"C:\\Wolfstack\"")
	print("  \twextract -x *.wav -o \"C:\\Wolfstack\" B.Misc_en.toc\n")
	print("    List all files within B.Font.toc and provide verbose information")
	print("  \twextract -l *.* -v B.Font.toc\n")
	print("    Extract all files from B.Font.toc to \"C:\\Wolfstack\" and suppress listing")
	print("  \twextract -x *.* -o \"C:\\Wolfstack\" -q B.Font.toc\n")
	print("  Verbose output example:")
	print("  \toffset: 8707577  timestamp: 131264436870630000  zSizeChunk: 12131  sizeChunk: 25579  reservedChunk: 0  idChunk: 19  nameChunk: DojoColorPicker.lua")
	os.exit(0)
end

local file = assert(io.open(fileName, "rb")) 

local fileHeader, fileVersion = string.unpack("ii", file:read(8))
magicNumber = string.pack(">i", magicNumber)
magicNumber = string.unpack("i", magicNumber)

if fileHeader == magicNumber then
--	print("Magic Number found:", fileHeader)
end

if fileVersion == versionNumber then
--	print("Version Number found:", fileVersion)
end

--[[
local toc = { [0] = { "", "" } }
local lastID = 0
local directories = {}
local files = {}
]]--

local current_depth = 0
local path = {}
local seen = {}
local files = {}

while file:read(0) do
	local offsetChunk, timestampChunk, zSizeChunk, sizeChunk, reservedChunk, idChunk, nameChunk = string.unpack("i8i8iiiiz", file:read(96))
	
	--[[
		offsetChunk    -  8 bytes - little endian 
		timestampChunk -  8 bytes - timestamp
		zSizeChunk     -  4 bytes - compressed size
		sizeChunk      -  4 bytes - uncompressed size
		reservedChunk  -  4 bytes - buffer
		idChunk        -  4 bytes - depth of file
		nameChunk      - 64 bytes - the name
	--]]

	--[[
		plan: 	if its a directory
				if the depth is 1 + current_depth
					add it into the path
				else
					cut path down to however much the depth is
			if its not a directory, append it to the current path and print the name
	--]]

	if offsetChunk == -1 then
		if seen[idChunk] == nil then
			-- this is a new path, just append to the current path
			current_depth = current_depth + 1
			table.insert(path, current_depth, nameChunk) -- if current depth is 0, insert at 1, if current depth is 1, 2 etc
			seen[idChunk] = current_depth 
			-- print(nameChunk, idChunk)
			-- print("\t" .. table.concat(path, "\\", 1, current_depth))
		else
			-- print(idChunk, nameChunk, "", "", seen[idChunk])
			-- print(nameChunk, idChunk)
			table.insert(path, seen[idChunk], nameChunk)
			current_depth = seen[idChunk]
		end
	else
		table.insert(files, {offsetChunk, zSizeChunk, sizeChunk, table.concat(path, "\\", 1, current_depth) .. "\\" .. nameChunk})
	end
end

table.sort(files, function(a, b) return a[1] < b[1] end)

print(string.format("%-8s", "offset"), 
	string.format("%-8s", "expect"),
	string.format("%-8s", "comp"), 
	string.format("%-8s", "real"), 
	string.format("%-8s","path"))


local expected_offset = 0

for k, v in pairs(files) do
	local msg = ""
	if (expected_offset ~= v[1]) then
		msg = expected_offset - v[1]
	end
	print(string.format("%-8s", v[1]), 
		string.format("%-8s", msg),
		string.format("%-8s", v[2]), 
		string.format("%-8s", v[3]), 
		string.format("%-8s", v[4]))
	expected_offset = v[1] + v[2]
end

file:close()
