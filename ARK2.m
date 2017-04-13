function [x, y, z] = ARK2(f, g, a, b, alpha, theta, h0, Tol)

% adaptive rk-2 method that uses rk-3 method as its companion
% f - function
% g - derivative of f with respect to y
% a - start of interval
% b - end of interval
% alpha - initial point (f(a))
% theta - step size reduction factor
% h0 - initial step size
% Tol - maximum error allowed

u = a; x = a;       % initial x value
v = alpha; y = alpha;   % initial y value
w = 0; z = 0;       % the errors
h = min(h0, b - a); % step size is min of step size and distance to end of interval
p = 2;

% pick the first step size that gets under the errors
while b > u
    [h, tau_est, k1, k2] = Check(f, u, v, h/theta, Tol, theta);
    % after this found appropriate step size with error estimate
    [u, v] = Advance(u, v, h, k1, k2);
    w = Monitor(g, u, v, w, h, tau_est);
    % add results to vector
    x = [x, u]; y = [y, v]; z = [z, w];
    h = Estimate(h, Tol, tau_est, p, b - u);
end
x = x'; y = y'; z = z';

function [h, tau_est, k1, k2] = Check(f, u, v, h, Tol, theta)
% return k1 and k2 values because they are used in the rk-2 method
Truncation = inf;
while Truncation > Tol
    h = h * theta;
    % use RK-3 from 4.6 to estimate truncation error3
    
    k1 = f(u, v); 
    k2 = f(u + (2/3) * h, v + (2/3) * h * k1);
    k3 = f(u + (2/3) * h, v + (2/3) * h * k2);
    % (((1/2)k1 + (3/4)k2 + (3/4)k3) / 2) - ((0.5 * k1 + 1.5 * k2) / 2) = 
    % 0 k1 +
    tau_est = -(3/8) * k2 + (3/8) * k3; % error estimated here
    Truncation = abs(tau_est);
end

function [u, v] = Advance(u, v, h, k1, k2)
% k1 = f(u, v); k2 = f(u + (2/3) * h, v + (2/3) * h * k1);
v = v + h * (0.25 * k1 + 0.75 * k2); u = u + h;

function w = Monitor(g, u, v, w, h, tau_est)
w = w + h * g(u, v) * w + h * tau_est;

function h = Estimate(h, Tol, tau_est, p, d)
h = min(h * (Tol / abs(tau_est)) ^ (1 / p), d);
