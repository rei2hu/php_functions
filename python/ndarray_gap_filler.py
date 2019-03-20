# fill holes in a holey n dimensional array
# the idea is to figure out in what order these things
# can be filled up in by building a graph and doing a
# topological sort

length = 10
dimensions = 4
r = range(length)

# all "edges" must be filled in an ndarray for
# it to be solvable. this method should create
# that array
def gen_minimum_solvable_ndarray(dim):
    def gen_filled_ndarray(dim):
        x = [1] * length
        for a in range(dim - 1):
            x = [x] * length
        return x

    x = [1] + [None] * (length - 2) + [1]
    for a in range(dim - 1):
        x = [gen_filled_ndarray(a + 1)] + [x] * (length - 2) + [gen_filled_ndarray(a + 1)]
    return x 

d4 = gen_minimum_solvable_ndarray(dimensions)

# when trying to solve the minimum array, a few circulars
# pop up. here i just fill them in with a number manually

# necessary for length 4
d4[1][3][1][1] = 4
d4[3][3][1][2] = 4
d4[1][1][1][3] = 4

# necessary for length 10
d4[1][5][6][4] = 4
d4[3][5][2][8] = 4
d4[1][1][3][5] = 4
d4[1][1][3][6] = 4
d4[3][1][2][7] = 4

start_vertices = set()
adjacency_list = {}

# graph building
def add_adj(a1, b1, c1, d1, a2, b2, c2, d2):
    start = "%s,%s,%s,%s" % (a1, b1, c1, d1)
    target = "%s,%s,%s,%s" % (a2, b2, c2, d2)
    start_vertices.discard(target)
    if start in adjacency_list:
        adjacency_list[start] = adjacency_list[start] + [target]
    else:
        adjacency_list[start] = [target]

# topological sort
def topo():
    visited = set()
    l = []

    def dfs(n):
        visited.add(n)
        if n in adjacency_list:
            for target in adjacency_list[n]:
                if target in visited:
                    # circular graph
                    raise Exception("circular, unsolvable, %s to %s" % (n, target))
                dfs(target)
        l.append(n)
    
    for start in start_vertices:
        if start not in visited:
            dfs(start)

    if len(visited) < pow(length, dimensions):
        raise Exception("not everything visited, there will be unfilled holes")

    l.reverse()
    return l

# find the numbers this position depends on
# these are the closest non hole numbers
# in each dimension
def search_dim(a, b, c, d, dim):
    dim_tup = [0, 0, 0, 0]
    a_diff, b_diff, c_diff, d_diff = dim_tup
    while d4[a + a_diff][b + b_diff][c + c_diff][d + d_diff] == None and \
            d4[a - a_diff][b - b_diff][c - c_diff][d - d_diff] == None:
        dim_tup[dim] = dim_tup[dim] + 1
        a_diff, b_diff, c_diff, d_diff = dim_tup

    add_adj(a + a_diff, b + b_diff, c + c_diff, d + d_diff, a, b, c, d)
    # print("d4[%d][%d][%d][%d] depends on d4[%d][%d][%d][%d]" % (a, b, c, d, \
    #         a + a_diff, b + b_diff, c + c_diff, d + d_diff))

    add_adj(a - a_diff, b - b_diff, c - c_diff, d - d_diff, a, b, c, d)
    # print("d4[%d][%d][%d][%d] depends on d4[%d][%d][%d][%d]" % (a, b, c, d, \
    #         a - a_diff, b - b_diff, c - c_diff, d - d_diff))

for a in r:
    for b in r:
        for c in r:
            for d in r:
                start_vertices.add("%s,%s,%s,%s" %(a, b, c, d))
    
for a in r:
    for b in r:
        for c in r:
            for d in r:
                if d4[a][b][c][d] != None:
                    continue
                search_dim(a, b, c, d, 0) # a
                search_dim(a, b, c, d, 1) # b
                search_dim(a, b, c, d, 2) # c
                search_dim(a, b, c, d, 3) # d

# this prints a way that you can fill in holes
# in a single pass, note that it will start
# with positions that already have numbers so
# you can skip those
print(topo())
