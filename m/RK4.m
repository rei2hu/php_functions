function[x,y]=RK4(f, a, b, alpha, n)

% RK-4 method

h = (b - a) / n;
x = a; y = alpha;
u = x; v = y;
for i = 1:n
    k1 = f(u,v);
    k2 = f(u + (h/2), v + (h/2) * k1);
    k3 = f(u + (h/2), v + (h/2) * k2);
    k4 = f(u + h, v + h * k3);
    v = v + (h/6) * (k1 + 2 * k2 + 2 * k3 + k4);
    u = u + h;
    x = [x, u];
    y = [y, v];
end
x = x'; y = y'
end
