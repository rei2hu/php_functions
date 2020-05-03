import requests
import re
import html
from multiprocessing.dummy import Pool

def grab_table(content):
    global MOB_COUNT
    grs = re.findall('<tr class=".*?">(?:\n| |.)*?<td class=".*?">((?:\n| |.)*?[0-9]{0,3})(?:\n| |.)*?<a href="(.*?)">(.*?)</a>', content)
    arr = [m[1] for m in grs]
    MOB_COUNT = len(grs)
    print('found', MOB_COUNT, 'mobs')
    res = pool.map(grab_info, arr) 
    pool.close()
    pool.join()

def grab_info(url):
    cont = requests.get(BASE_URL + url, verify=False).content.decode()
    info = re.search('<strong>HP:</strong>(?:\n| |.)*?([0-9,?]{1,11})(?:\n| |.)*?</td>(?:\n| |.)*?<strong>MP:</strong>(?:\n| |.)*?([0-9,?]{1,11})(?:\n| |.)*?</td>(?:\n| |.)*?<strong>EXP:</strong>(?:\n| |.)*?([0-9,?]{1,11})(?:\n| |.)*?</td>(?:\n| |.)*?', cont)
    # name, hp, mp, exp
    name = url.split('/')[2]
    mobs.append([name] + [info.group(x).replace(",", "") for x in range(1, 4)])
    print(len(mobs), '/', MOB_COUNT, 'done. grabbed', name)

MOB_COUNT = 0
BASE_URL = 'https://bbb.hidden-street.net'
FILE_NAME = 'mobs.csv'
pool = Pool(8)

mobs = []
cont = requests.get(BASE_URL + '/monster/list', verify=False).content.decode()
grab_table(cont)
print('writing to file')
with open(FILE_NAME, 'w') as f:
    for info in mobs:
        f.write(', '.join(info) + '\n')
print('finished writing')
