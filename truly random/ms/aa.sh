#!/bin/bash

get_win() {
    local result=$(xdotool search --name MapleStory)
    echo $result
}

get_pid() {
    echo $(pidof -s "C:\\Program Files\\MapleStory\\MapleStory.exe")
}

LAST_BUFFED=0
LAST_DRAIN=0
LAST_POTTED=0
LAST_PET=$(date +"%s")

check_pet() {
    if [ $(($(date +"%s") - LAST_PET)) -gt 900 ]; then
        echo "feeding pet"
        send ${pet2[@]}
        LAST_PET=$(date +"%s")
    fi
}

check_buffs() {
    if [ $(($(date +"%s") - LAST_BUFFED)) -gt 100 ]; then
        # send ${knock_back[@]/#/}
        # sleep 0.75
        echo "casting buffs"
        send ${buffs1[@]}
        sleep 1
        send ${buffs2[@]}
        sleep 2.75
        LAST_BUFFED=$(date +"%s")
        reset_combo
        reset_combo
    fi
}

check_pots() {
    if [ $(($(date +"%s") - LAST_POTTED)) -gt 480 ]; then
        echo "drinking pots"
        send ${pot1[@]}
        sleep 0.75
        send ${pot2[@]}
        LAST_POTTED=$(date +"%s")
    fi
}

check_drain() {
    if [ $(($(date +"%s") - LAST_DRAIN)) -gt 100 ] && [ $COMBO_CHECKER -gt 4 ]; then
        # send ${knock_back[@]/#/}
        # sleep 0.75
        echo "casting drain"
        send ${combo_drain1[@]}
        sleep 0.2
        send ${combo_drain2[@]}
        LAST_DRAIN=$(date +"%s")
        COMBO_CHECKER=0
        FAIL_CHECKER=0
        sleep 1
    fi
}

combo_smash_left() {
    if [ $COMBO_CHECKER -gt 3 ]; then
        echo "smashing left"
        send ${combo_smash_l[@]}
        sleep 1
        COMBO_CHECKER=0
        FAIL_CHECKER=0
    fi
}

combo_smash_right() {
    if [ $COMBO_CHECKER -gt 3 ]; then
        echo "smashing right"
        send ${combo_smash_r[@]}
        sleep 1
        COMBO_CHECKER=0
        FAIL_CHECKER=0
    fi
}

x_pos_addr="333430"

get_x_pos() {
    echo $(sudo ./readmem ${PID} ${x_pos_addr} 4)
}

COMBO_CHECKER=0
FAIL_CHECKER=0

reset_combo() {
    FAIL_CHECKER=$((FAIL_CHECKER+1))
    if [ $FAIL_CHECKER -gt 1 ]; then
        FAIL_CHECKER=0
        COMBO_CHECKER=0
    fi
}

add_combo() {
    COMBO_CHECKER=$((COMBO_CHECKER+1))
    FAIL_CHECKER=0
}

# format
# if there's a number, its a sleep
# otherwise it better be a key name

pet1=("o")
buffs1=("Page_Up")
buffs2=("Home")
pot1=("t")
pot2=("u")

knock_back=("Up" "Up" "ctrl")
combo_drain1=("Down" "Down")
combo_drain2=("ctrl")
combo_smash_r=("Down" "Right" "ctrl")
combo_smash_l=("Down" "Left" "ctrl")

triple_attack_r=("Right" "ctrl" "ctrl" "ctrl")
triple_attack_l=("Left" "ctrl" "ctrl" "ctrl")
triple_attack_rush_r=("ctrl" "ctrl" "ctrl" "ctrl" "ctrl" "ctrl" "ctrl" "ctrl" "ctrl" "ctrl" "ctrl" "ctrl" "Right" "ctrl")
triple_attack_rush_l=("ctrl" "ctrl" "ctrl" "ctrl" "ctrl" "ctrl" "ctrl" "ctrl" "ctrl" "ctrl" "ctrl" "ctrl" "Left" "ctrl")

quit_game=(1 "Escape" 1 "Up" 1 "Return")

# first parameter for sleep duration
# n parameters for keys to press
send() {
    xdotool key --window ${WIN_ID} ${@}
}

walk_l() {
    xdotool keydown --window ${WIN_ID} "Left"
    sleep $1
    xdotool keyup --window ${WIN_ID} "Left"
}

walk_r() {
    xdotool keydown --window ${WIN_ID} "Right"
    sleep $1
    xdotool keyup --window ${WIN_ID} "Right"
}

# check sudo
if [ "${EUID}" -ne 0 ]
  then echo "Please run as root"
  exit
fi

WIN_ID=$(get_win)
PID=$(get_pid)

echo "Searching for MS window"
echo "Window ID: ${WIN_ID}. Process ID: ${PID}"
echo "Starting in 1"
sleep 1
echo "Starting..."

# tank map
# leftmost:              -3542
# rightmost:             -1171
# weapon range (normal): 150
# knockedback range:     150

GOING_RIGHT=true

# send ${triple_attack_rush_r[@]}
# sleep 2
# send ${buffs[@]}
# sleep 3.75
# send ${triple_attack_rush_r[@]}
# sleep 2

while :
do
    mobcount=1 #$(get_mob_count)
    potcount=1 #$(get_pot_count)
    check_pet
    check_drain
    check_buffs
    check_pots
    xpos=$(get_x_pos)
    if [ $xpos -gt -1400 ] && [ $xpos -lt 1550 ]; then
        # if we reached the end, then turn around
        if [ $xpos -gt 1400 ]; then
            echo "turning around <" 
            GOING_RIGHT=false
            walk_l 0.1
        elif [ $xpos -lt -1200 ]; then
            echo "turning around >"
            GOING_RIGHT=true
            walk_r 0.1
        fi

        echo "xpos:${xpos}, combo:${COMBO_CHECKER}"
        # if im going right then try to rush attack to right
        if [ $GOING_RIGHT = true ]; then        
            send ${triple_attack_rush_r[@]}
            sleep 2.1
            newxpos=$(get_x_pos)
            if [ $newxpos -gt -1400 ] && [ $newxpos -lt 1500 ]; then
                # if we didnt move enough, slide once to the right
                if [ $((newxpos - xpos)) -lt 105 ]; then
                    # while [ $((newxpos - xpos)) -lt 125 ] && [ $newxpos -lt 1250 ]
                    # do
                        echo "didnt move far enough, moving a little ${newxpos}"
                        walk_r 1.5
                    # done
                    reset_combo
                # elif [ $((newpos - xpos)) -lt 75 ]; then
                #     echo "got hit from other side, turning"
                #     GOING_RIGHT=false
                else
                    add_combo
                fi
            fi
        # going left 
        else
            send ${triple_attack_rush_l[@]/#/}
            sleep 2.1
            newxpos=$(get_x_pos)
            if [ $newxpos -gt -1400 ] && [ $newxpos -lt 1500 ]; then
                # if we didnt move enough, slide once to the right
                if [ $((xpos - newxpos)) -lt 105 ]; then
                    # while [ $((xpos - newxpos)) -lt 125 ] && [ $newxpos -gt -3450 ]
                    # do
                        echo "didnt move far enough, moving a little ${newxpos}"
                        walk_l 1.5
                    # done
                    reset_combo
                # elif [ $((xpos - newpos)) -lt 75 ]; then
                #     echo "got hit from other side, turning"
                #     GOING_RIGHT=true
                else
                    add_combo
                fi
            fi
        fi
    else
        echo "${xpos}"
    fi
done












