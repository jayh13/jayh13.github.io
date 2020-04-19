[{"seq":1,"desc":"Remove Page numbering","frompattern":"\\n^Page (.*) of [0-9]*$","topattern":"","applied":""},{"seq":2,"desc":"Remove Branding","frompattern":"^Sherwin-Williams .*20[01234][0-9]$\\n","topattern":"","applied":""},{"seq":3,"desc":"Remove Legend","frompattern":"\\n^(AT = Made in USA Trilingual Label|GH = Industrial Blank|G2 = Previous Made in USA GHS Label|G3 = Current Made in USA GHS Label|M&S = Make & Ship|)$","topattern":"","applied":""},{"seq":4,"desc":"Remove all but the first category line","frompattern":"\\n^(Architectural|Light Industrial|Pro Industrial) Products REX NO. SMIS # SIZE UPC$","topattern":"","applied":""},{"seq":5,"desc":"Remove product lines that are continued","frompattern":"\\n^.*Cont'd.*$","topattern":"","applied":""},{"seq":6,"desc":"Fix a product that has a linefeed in it","frompattern":"^(Emerald|Krylon).$\\n^ (Rain|Chalky)","topattern":"$1$2","applied":""},{"seq":7,"desc":"Fix product options missing their leading space, works as long as no product start with these words","frompattern":"^(Clear|Aerosol|Simply|Extra|Deep)","topattern":" $1","applied":""},{"seq":8,"desc":"Convert product option lines with a status","frompattern":"^(disc|New 2019|New 2020|Regional|Prep|M&S|US ONLY) (.*) ([A-Z0-9\\.]*) ([0-9]*) ([1-4] Gal Kit|[1-4] Gal Pail|[1-8] Qt Kit|[0-9\\.]* OZ|[0-9]* Each|[A-Za-z0-9]*) ([0-9]*[ \\-][0-9]*)$","topattern":"{ \"status\":\"$1\", \"color\":\"$2\", \"rexno\":\"$3\", \"smisno\":\"$4\", \"size\":\"$5\", \"upc\":\"$6\" },","applied":""},{"seq":9,"desc":"Convert all of the other product option lines","frompattern":"^ (.*) ([A-Z0-9\\.]*) ([0-9]*) ([1-4] Gal Kit|[1-4] Gal Pail|[1-8] Qt Kit|[0-9\\.]* OZ|[0-9]* Each|[A-Za-z0-9]*) ([0-9]*[ \\-][0-9]*)$","topattern":"{ \"color\":\"$1\", \"rexno\":\"$2\", \"smisno\":\"$3\", \"size\":\"$4\", \"upc\":\"$5\" },","applied":""},{"seq":10,"desc":"Convert the category record","frompattern":"^(Architectural|Light Industrial|Pro Industrial) Products REX NO. SMIS # SIZE UPC$","topattern":"{ \"category\": \"$1\",\"products\": [","applied":""},{"seq":11,"desc":"Convert product records that have instructions and labels","frompattern":"^([ A-Z0-9].*) (do not tint|BAC Max|CCE|/|Twist & Pour) (AT|GH|G2|G3) ([0-9(( )?\\-( )?)]*)$","topattern":"]},{ \"product\": \"$1\", \"instructions\":\"$2\", \"label\":\"$3\", \"code\": \"$4\", \"options\":[","applied":""},{"seq":12,"desc":"Convert product records that have instructions","frompattern":"^([ A-Z0-9].*) (do not tint|BAC Max|CCE|/|Twist & Pour) ([0-9][0-9] ?- ?[0-9][0-9] ?- ?[0-9][0-9][0-9])$","topattern":"]},{ \"product\": \"$1\", \"instructions\":\"$2\", \"code\": \"$3\", \"options\":[","applied":""},{"seq":13,"desc":"Convert product records that have labels","frompattern":"^([ A-Z0-9].*) (AT|GH|G2|G3) ([0-9][0-9][ ]?-[ ]?[0-9][0-9][ ]?-[ ]?[0-9][0-9][0-9])$","topattern":"]},{ \"product\": \"$1\", \"label\":\"$2\", \"code\": \"$3\", \"options\":[","applied":""},{"seq":14,"desc":"Convert remaining product records","frompattern":"^([ A-Z0-9].*) ([0-9][0-9] ?- ?[0-9][0-9] ?- ?[0-9][0-9][0-9])$","topattern":"]},{ \"product\": \"$1\", \"code\": \"$2\", \"options\":[","applied":""},{"seq":15,"desc":"Fix the error we created with the first product record","frompattern":"\"products\": \\[\\n]},{ \"product\"","topattern":"\"products\": [{ \"product\"","applied":""},{"seq":16,"desc":"Fix the error with the last element in an array","frompattern":"},\\n]","topattern":"}]","applied":""},{"seq":17,"desc":"Fix the end of file","frompattern":"},$(?!\\n)","topattern":"}]}]}","applied":""},{"seq":18,"desc":"","frompattern":"","topattern":"","applied":""}]