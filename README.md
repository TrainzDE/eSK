# eSK
eSK - extensible Station Kit
eSK stellt ein Bahnsteigsystem dar, das durch jeden mit weiteren Inhalten erweitert werden kann.
Hierzu bestand vor einiger Zeit unter trai.nz/eSK eine Anleitung, die leider verloren ging, ich werde diese im Lauf der Zeit neu verfassen.

Dieser Lexikon-Eintrag darf natürlich von jedem Nutzer mit-erweitert werden :)

#1 Nutzung:
Die Nutzung von eSK beim Streckenbau hat Mika im folgenden Video beschrieben:
https://www.youtube.com/watch?v=QG2vFTdicHU

#2 Weitere Inhalte hinzufügen
Im Grunde ist die Erweiterung durch eigene Inhalte kein Problem, ob nun Bahnsteigschilder, Displays, eigene Bahnsteige oder Bahnhofstemplates ("unsichtbare Bahnsteige"),

alles ist recht simpel erweiterbar.

Ich stelle hier bei Bedarf gerne auch Beispielobjekte samt Meshes zur Verfügung, hierzu bitte private Nachricht an mich ( Sebastian ). Es ist geplant, diese später auch zum Download anzubieten.

##2.1 Bahnhofstemplates (Vorlagen)
Bahnhofstemplates stellen die Basis für die interaktiven Bahnsteige dar, diese können enstsprechend konfiguriert und mit den gewünschten Splines angepasst werden.

Derzeit existieren Einzelbahnsteige in unterschiedlichen Längen und Höhen, es sind aber auch komplette Bahnsteige als Vorlage möglich - und geplant.

Wie alle Passagierbahnsteige in Trainz bestehen diese aus folgenden Helpern, in eSK zusätzliche Helper sind blau markiert.

Andockpunkte für Gleise
Trigger für den Passagierwechsel / die Bahnhofsfunktionalität
Passagierhelper (stehend+Sitzend) für wartende Passagiere
Passagierhelper für aussteigende Passagiere
Andockpunkte für Bahnsteigssplines
Andockpunkte für Bahnsteigverbreiterung bzw. Böschungssplines
Andockpunkte für Bahnsteisabgrenzung (Zaun)
Displaypositionen
Bahnhofsschildpositionen
Lampenpositionen
Die Bennenung und die Konfiguration der Helper kann bei Bedarf den Beispielassets entnommen werden:

eSK_platform_templates.zip

Natürlich kann eine Bahnhofsvorlage auch weitere Gestaltung wie zB. ein Empfangsgebäude enthalten.

##2.2 Bahnsteigsplines
Die Bahnsteigsplines sind 4m breit und haben die Höhe des höchsten Bahnsteigs (derzeit 96cm ab Gleisoberkante, d.h. insgesamt 126cm Höhe), werden niedrigere Bahnsteige genutzt, so werden die Splines entsprechend "versenkt".

Zukünftig soll hier verstärkt auf saisonale Funktion gesetzt werden. Die Bahnsteige fallen von der Bahnsteiggkante vom Gleis minimal ab, sodass es kein bzw. kaum Flimmern beim Ineinander-Schieben gibt, sodass auch zusammenlaufende Bahnsteige möglich werden.

Für jeden Bahnsteigspline ist ein entsprechender "Weg"-Spline vorgesehen, der für die Zuwegung, aber auch für die Verbreiterung eines Bahnsteigs genutzt werden kann, wobei manche Bahnsteige sich den gleichen Wegspline aufgrund der gleichen Textur teilen.

##2.3 Displays / Schilder
Die Displays und Schilder sind Meshes mit entsprechenden Helpern zur Darstellung von Texten.

Für jedes Display und Schild sind zwei Assets vorgesehen, ein Mesh-Asset, das das eigentliche Mesh und die Konfiguration enthält und durch die Bahnsteigsvorlagen eingebunden werden kann, dazu ein Szenerie-Objekt, das die freie Plazierung des Displays/Schildes erlaubt, hier kann das Display/Schild mit der eigentlichen Bahnsteigsvorlage verknüpft werden.
