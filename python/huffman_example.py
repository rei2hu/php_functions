from collections import namedtuple
from itertools import groupby

Node = namedtuple('Node', ['left', 'right', 'value', 'occurrences'])
RebuiltNode = namedtuple('RebuiltNode', ['left', 'right', 'value'])


def make_huff_tree(symbols):
    if len(symbols) == 1:
        return symbols.pop()

    left = symbols.pop(0)
    right = symbols.pop(0)
    # this is an inner node so there is no value
    symbols.append(
        Node(left, right, None, left.occurrences + right.occurrences))
    # inefficient, but basically I want to guarantee that the first two things
    # in the list are the ones with the least occurrences - this is typically
    # done with a priority queue
    symbols.sort(key=lambda s: s.occurrences)
    return make_huff_tree(symbols)


def generate_code_book(tree):
    book = {}

    def traverse(tree, pattern):
        if not (tree.left or tree.right):
            book[tree.value] = ''.join(map(str, pattern))
            return
        if tree.left:
            traverse(tree.left, pattern + ['0'])
        if tree.right:
            traverse(tree.right, pattern + ['1'])

    traverse(tree, [])
    return book


def encode_huff_tree(tree):
    # a leaf node
    if not (tree.left or tree.right):
        return ['0', format(ord(tree.value), 'b').zfill(8)]
    return ['1'] + encode_huff_tree(tree.left) + encode_huff_tree(tree.right)


def decode_huff_tree(encoded):
    node = encoded.pop(0)
    if node == '1':
        # an inner node
        return RebuiltNode(decode_huff_tree(encoded), decode_huff_tree(encoded), None)
    else:
        # a leaf node
        r = RebuiltNode(None, None, chr(int(''.join(encoded[0:8]), 2)))
        del encoded[0:8]
        return r


def decode_encoded(root, tree, encoded):
    if not (tree.left or tree.right):
        return [tree.value] + decode_encoded(root, root, encoded)
    if len(encoded) == 0:
        return []

    node = encoded.pop(0)
    if node == '1':
        return decode_encoded(root, tree.right, encoded)
    else:
        return decode_encoded(root, tree.left, encoded)


data = "AAAACABBDDECCDD"
# string representation of the bits
unencoded = ''.join(format(ord(c), 'b').zfill(8) for c in data)
unencoded_length = len(unencoded)

# "fun" way to get char counts
symbols = list(
    map(lambda a: Node(None, None, a[0], len(list(a[1]))), groupby(sorted(data))))
symbols.sort(key=lambda s: s.occurrences)

# make the tree
tree = make_huff_tree(symbols)
# make the codebook
codebook = generate_code_book(tree)
# replace symbols with codewords
encoded = ''.join(map(lambda c: codebook[c], data))

# generate the tree representation
enc_tree = encode_huff_tree(tree)
# prepend to the encoded data
encoded = ''.join(enc_tree) + encoded
encoded_length = len(encoded)

# now let's unencode it!
to_be_decoded = list(encoded)
decoded_tree = decode_huff_tree(to_be_decoded)
decoded = ''.join(decode_encoded(decoded_tree, decoded_tree, to_be_decoded))

print(f"""\
Unencoded Length: {len(unencoded)}
Unencoded: {unencoded}
Encoded Length: {len(encoded)}
Encoded: {encoded}

Data: {data}
Decoded: {decoded}
""")
