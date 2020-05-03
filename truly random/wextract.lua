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


local toc = { [0] = { "", "" } }
local lastID = 0
local directories = {}
local files = {}

while file:read(0) do
	local offsetChunk, timestampChunk, zSizeChunk, sizeChunk, reservedChunk, idChunk, nameChunk = string.unpack("i8i8iiiiz", file:read(96))
	if idChunk > lastID then
		toc[idChunk] = { toc[lastID][1].."\\"..toc[lastID][2], nameChunk }
	else
		toc[idChunk] = { toc[idChunk][1], nameChunk }
	end
	lastID = idChunk

	if offsetChunk == -1 then 
		directories[#directories+1] = toc[idChunk][1].."\\"..toc[idChunk][2]
		if list then
			print(toc[idChunk][1].."\\"..toc[idChunk][2])
			if verbose then
				print("Type: Directory " .. "  idChunk: ".. idChunk.."  nameChunk: "..nameChunk)
			end
		end
	else
		files[#files+1] = toc[idChunk][1].."\\"..toc[idChunk][2]
		if list then
			print(toc[idChunk][1].."\\"..toc[idChunk][2])
			if verbose then
				print("Type: File " .. "  offset:  "..offsetChunk.."  timestamp: "..timestampChunk.."  zSizeChunk: "..zSizeChunk.."  sizeChunk: "..sizeChunk.."  reservedChunk: ".. reservedChunk.."  idChunk: ".. idChunk.."  nameChunk: "..nameChunk)
			end
		end
	end
end

for k,v in pairs(directories) do
--	print(v)
end

for k,v in pairs(files) do
--	print(v)
end

file:close()