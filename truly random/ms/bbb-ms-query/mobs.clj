(use 'clojure.pprint)
; simple record for mob info
(defrecord Mob [n h m e])

; simple parseint
(defn parse-int [s]
  (try (Integer/parseInt s)
       (catch Exception e -1)))

; split line by commas and then parse each
; line into a `Mob` record which is then
; put into the list which is returned
(defn parsecsv [csv]
  (letfn [(p [acc, ele]
            (let [[n h m e] (clojure.string/split ele #", ")]
              (conj acc (Mob. n (parse-int h) (parse-int m) (parse-int e)))))]
    (reduce p [] csv)))

; calculate the exp ratios of mobs
; returns a `Mob` record with the extra field
; `e` for the hp:exp ratio
(defn expratios [mobs]
  (sort-by :r (map (fn [e] 
                            (let [hp (:h e)
                                  exp (:e e)]
                              (assoc e :r
                                     (if (or (< hp 0) (< exp 0))
                                       10001
                                       (/ hp exp))))) mobs)))

; returns a function that can be used for filtering
; results
; fun - function to compare two values
; k   - field to look at
; v   - value to compare against
(defn compr [fun k v]
  (fn [x] (fun (k x) v)))

; actually parse the csv
(with-open [rdr (clojure.java.io/reader "mobs.csv")]
  (def mobs (parsecsv (line-seq rdr))))

;; ex 1
;; here we want to print the top 20 mobs whose hp is less than 100
;; with the lowest hp:exp ratio
; (pprint (take 20 (filter (compr < :h 100) (expratios mobs))))

;; ex 2
;; here we try to take mobs with a good hp:exp ratio whose hp is witin 2000 of 14000
;(defn around [e, n]
;  (and (<= (- n 2000) e) (>= (+ n 2000) e)))

;(pprint (take 50 (filter (compr around :h 14000) (expratios mobs))))












