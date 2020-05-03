function [x, y] = ABII(f, a, b, alpha, n)

% f     - function
% a     - interval start
% b     - interval end
% alpha - initial value
% n     - subintervals

h = (b - a) / n;

% calculate 2nd point with Euler's
% y1 = y0 + h * f(x0, y0);
% u = a + h; v = alpha + h * f(a, alpha);

% vector starts with 2 entries now
x = [a, a + h]; y = [alpha, alpha + h * f(a, alpha)];

% n - 1 because calculated one already
% supposed to be from 1 to n - 1 but redone to be from
% 3 to n + 1 so I can use the vectors easily
for i=3:n+1
    y_approx = y(i-1) + h * ((3/2) * f(x(i-1), y(i-1)) - (1/2) * f(x(i-2), y(i-2)));
    x = [x, x(i-1) + h];
    y = [y, y_approx];
end

x = x'; y = y';
