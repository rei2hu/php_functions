#define _GNU_SOURCE
#include <dlfcn.h>
#include <X11/Xlib.h>

typedef int (*orig_xnext)(Display *display, XEvent *event_return);

int XNextEvent(Display *display, XEvent *event_return)
{
    switch (event_return->type)
    {
        case KeyPress:
        case KeyRelease:
        case ButtonPress:
        case ButtonRelease:
            event_return->xany.send_event = False;
    }
    orig_xnext o;
    o = (orig_xnext)dlsym(RTLD_NEXT,"XNextEvent");
    return o(display, event_return);
}
