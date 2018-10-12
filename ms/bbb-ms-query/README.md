A simple clojure file that can be loaded to mess around with mob info for Maplestory.

##### How to run:
If this is your first time running, use
```
make
```
This will crawl the hidden-street and output your data file.
If you already have a data file, just use
```
make clj
```
Which will start a REPL and load the clj file.

##### Examples
You can find these examples in the clj file
```clj
; print the top 20 mobs with the best hp to exp ratios and whose hp is less than 100
user=> (pprint (take 20 (filter (compr < :h 100) (expratios mobs))))
({:n "delinquent-rudolph", :h 3, :m 0, :e 250, :r 3/250}
 {:n "broken-wires", :h 20, :m 0, :e 33, :r 20/33}
 {:n "gas-tank", :h 20, :m 0, :e 33, :r 20/33}
...
```
```clj
; print the top 50 mobs with the best hp to exp ratios whos hp is within 2000 of 14000
user=> (defn around [e, n] (and (<= (- n 2000) e) (>= (+ n 2000) e))) 
#'user/around
user=> (pprint (take 50 (filter (compr around :h 14000) (expratios mobs))))
({:n "mt-09", :h 13500, :m 170, :e 980, :r 675/49}
 {:n "prime-minister", :h 12500, :m 100, :e 800, :r 125/8}
 {:n "windraider", :h 16000, :m 400, :e 800, :r 20}
...
```

##### Other things that you don't care about
This was just supposed to be a small project to test Java interop for Clojure where I would create classes in
Java and process the raw .wz files in Clojure. But then I realized the format was more complicated than I expected
when it came to the encoded strings and such so I just made a crawler to pull the site info from hidden-street.
