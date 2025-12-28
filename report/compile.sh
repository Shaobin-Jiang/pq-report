#/bin/sh
FILE=out
rm $FILE.aux
rm $FILE.log
rm $FILE.out
pdflatex $FILE.tex
bibtex $FILE
pdflatex $FILE.tex
pdflatex $FILE.tex
