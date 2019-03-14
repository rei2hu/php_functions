#include <iostream>
#include <math.h>

// a program that fills in holes of a list
// where each hole is filled out in the following way:
//
//   if this hole's left and right is not empty, then fill it with
//   the average of those two values
//
//   if there is a run of holes, e.g. a _ _ _ _ _ b, then the center
//   of that run is calculated first i.e. a _ _ (a+b)/2 _ _ b
//
//   if the run of holes is even, then fill out the hole to the left
//   of the center first e.g. a _ _ _ _ b -> a _ (a+b)/2 _ _ b
//
// solution: given a run of holes, we can calculate what goes
// in its spot with the formula ((2^d-1)s1+s2)/(2^d)
// where
//   d = distance from center
//   s1 = side closer to
//   s2 = side further from
// for example the first slot in a _ _ _ _ _ b would be 
// ((2^3-1)a + b)/(2^3)
//   = (7a+b)/8
//   => a (7a+b)/8 _ _ _ _ b

int main() {
	// anything < 0 counts as a hole for ease
	float list[] = {1, 2, -1, 3, -1, -1, -1, 10, -1, -1, 5};
	int length = 11;
	int i = 0, l = 0, r = 0;
	while (i < length) {
		if (list[i] < 0) {
			// get left of this gap
			l = i - 1;
			// advance one
			i++;

			// get right of the gap
			while (i < length && list[i] < 0) i++;
			// check if hole on right edge of list
			if (i >= length) throw std::runtime_error("taihen");
			r = i;

			// check if gap is even or odd
			bool even = (r - l) & 1 > 0;
			int half = (l + r) / 2;
			// fill in leftish hole first
			// reset r to be that thing we just filled in
			if (even) {
				list[half] = (list[l] + list[r]) / 2;
				r = half;
				half = (l + r) / 2;
			}
			i = l + 1;
			std::cout << i << l << half << r << std::endl;
			// [1, 2, 2.5, 3, 4.75, 6.5, 8.25, 10, 7.5, 6.25, 5]
			// fill in using formula
			for (; i <= half; i++) {
				float p2 = pow(2, half - i) + 1;
				list[i] = ((p2 - 1) * list[l] + list[r]) / p2; 
			}
			for (; i < r; i++) {
				float p2 = pow(2, r - i) + 1;
				list[i] = ((p2 - 1) * list[r] + list[l]) / p2; 
			}
			// advance past this gap
			i = r + 1;
		} else {
			i++;
		}
	}
	for (int i = 0; i < length; i++) {
		std::cout << list[i] << std::endl;
	}
}
