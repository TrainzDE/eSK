include "esklib2.gs"

/*
config.txt Eintraege:
attached-track: track_XXX
 XXX=Gleisnummer (1...N)

attached-trigger: trigger_track_XXX_y
 XXX=Gleisnummer (1...N), y=Triggernummer /-buchstabe
 y="ende1" am Trackanfang (s. attached tracks), y="ende2" am Trackende

 XXX bei track und trigger müssen übereinstimmen!

modified by p-dehnert 20130523
*/

class ESKGS isclass ESK_STATION
{
};
