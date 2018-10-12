COLOR1='28'
COLOR2='22'
COLOR3='240'
USER='\[\e[48;5;${COLOR1}m\]\[\e[30m\] ðŸ–³  \u'
JOBS='[\j]'
# JOBS='@'
HOST='\h '

limit_dir() {
		# greater than 5 directories deep
		# if [ $(echo "$PWD" | grep -o "/" | wc -l) -gt 5 ]; then
		# or 40 letters long
		# el
		if [ ${#PWD} -gt 40 ]; then
		    arr=(${PWD//\// })
			for i in "${arr[@]}"
			do
				# cut dir names to first letter
				if [ "$i" != ${arr[-1]} ]; then
					echo -n "/${i:0:1}"
				# except for last one
				else
					echo -n "/$i"
				fi
			done
		else
			echo -n "$PWD"
		fi
}

DIR='\[\e[48;5;${COLOR2}m\]\[\e[38;5;${COLOR1}m\]î‚° \[\e[30m\]ðŸ—  $(limit_dir) '

git_status() {
    local hash=$(git log --pretty=format:'%h' -n 1 2> /dev/null)
    local content="-"
    if [ ! $hash == "" ]; then
        # how far ahead or behind you are compared to upstream branch
        local behind_ahead=$(git rev-list --count --left-right '@{upstream}...HEAD' 2> /dev/null)
        local ahead="${behind_ahead#*	}"
        local behind="${behind_ahead%	*}"

        # how many files are changed so far
        local total_changes=$(git status -s 2> /dev/null | wc -l)
        # how many files are staged
        local added_changes=$(git diff --cached --name-only 2> /dev/null | wc -l)

        content=" î‚  $(basename `git rev-parse --show-toplevel` 2> /dev/null)/$(__git_ps1 "%s") "
        content+="(${hash}) "
        if [ ! "0$behind" -eq 0 ]; then
            content+="${behind}-"
        fi
        if [ ! "0$behind" -eq 0 ] && [ ! "0$ahead" -eq 0 ]; then
            content+="/"
        fi
        if [ ! "0$ahead" -eq 0 ]; then
            content+="${ahead}+"
        fi

        if [ ! "0$total_changes" -eq 0 ]; then
            content+=" î‚± ($added_changes/$((total_changes-added_changes)))"
        fi
        # if untracked file, put asterisk
        if [ ! $(git ls-files --others --exclude-standard 2>/dev/null | sed q1) == "" ]; then
            content+="U"
        fi
    fi
    echo -e $content
}

GIT='\[\e[48;5;${COLOR3}m\]\[\e[38;5;${COLOR2}m\]î‚° \[\e[30m\]$(git_status) '
END='\[\e[m\]\[\e[38;5;${COLOR3}m\]î‚°\[\e[m\] '

export PS1=$USER$JOBS$HOST$DIR$GIT$END
