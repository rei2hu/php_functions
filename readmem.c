#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include <sys/uio.h>

int getintvalue(char[], int);
int readbytes(pid_t, int, char[], int);

int main(int argc, char *argv[])
{
    if (argc < 4)
    {
        printf("Usage: blah [pid] [address] [size]\n");
        return 0;
    }

    pid_t pid = atoi(argv[1]);
    int addr = (int) strtol(argv[2], NULL, 16);
    int size = atoi(argv[3]);
    char buf[size];

    readbytes(pid, addr,  buf, size);
    int x = getintvalue(buf, size);
    printf("%d", x);
    return 0;
}

int readbytes(pid_t pid, int addr, char c[], int size)
{
    struct iovec local[1];
    struct iovec remote[1];
    char buf1[size];
    ssize_t nread;

    local[0].iov_base = buf1;
    local[0].iov_len = size;

    remote[0].iov_base = (void *) addr;
    remote[0].iov_len = size;
    nread = process_vm_readv(pid, local, 1, remote, 1, 0);
    if (nread != size) {
        return 1;
    }
    memcpy(c, buf1, size);
    return 0;
}

int getintvalue(char c[], int len)
{
    int total = 0;
    for (int i = 0; i < len; i++) {
        total |= (c[i] & 0xff) << (len * 2 * i);
    }
    return total;
}
