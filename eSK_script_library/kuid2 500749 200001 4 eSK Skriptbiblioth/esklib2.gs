include "GenericPassengerStation.gs"
include "trainzassetsearch.gs"
/*
config.txt Eintraege:
attached-track: track_XXX
 XXX=Gleisnummer (1...N)

attached-trigger: trigger_track_XXX_y
 XXX=Gleisnummer (1...N), y=Triggernummer /-buchstabe
 y="ende1" am Trackanfang (s. attached tracks), y="ende2" am Trackende

 XXX bei track und trigger müssen übereinstimmen!

modified by p-dehnert 20180306
*/

// Dummy entry for library
class ESK_LIBRARY isclass Library { };

//Beginn Ergänzung externe Displays (callavsg)

class ExternalDisplayMO isclass MapObject 
{ 
	ESK_LIBRARY			m_Library = null;
	Asset				m_MeshAsset = null;
	string[]			m_asMountings = new string[0];
	string				m_sDefaultMask = "X0";
	string				m_sMask = "X0";
	StringTable			m_StringTable = null;
	StringTable			m_GlobalStrings = null;
	int					m_iMounting = -1;
	
	void LoadMountingTypes(Asset _Asset);
	void LoadDisplaySettings(void);
	
	public void Init(Asset _Asset)
	{
		inherited(_Asset);
		
		m_StringTable = _Asset.GetStringTable();
		LoadMountingTypes(_Asset);
		
		m_MeshAsset = World.FindAsset(_Asset.LookupKUIDTable("mesh-asset"));
		LoadDisplaySettings();
		
		Library _Lib = World.GetLibrary(_Asset.LookupKUIDTable("esk-lib"));
		if(!_Lib)return;
		if(!_Lib.isclass(ESK_LIBRARY))return;
		m_Library = cast<ESK_LIBRARY>_Lib;
		m_GlobalStrings = m_Library.GetAsset().GetStringTable();
	}
	
	public string GetDescriptionHTML(void)
	{
		string sHtml = "<html><body><font color=#000000>";
		sHtml = sHtml + "<table width=100% cellspacing=2 cellpadding=2 bgcolor=#70381C>";
		
		int i;
		for(i = 0; i < m_asMountings.size(); i++)
		{
			sHtml = sHtml + "<tr>";
				sHtml = sHtml + "<td bgcolor=#904824>" + HTMLWindow.RadioButton("live://property/mounting[" + i + "]", (m_iMounting == i)) + "</td>"; 
				sHtml = sHtml + "<td bgcolor=#904824>" + m_StringTable.GetString(m_asMountings[i]) + "</td>";
			sHtml = sHtml + "</tr>";
		}
		
		sHtml = sHtml + "<tr>";
			sHtml = sHtml + "<td bgcolor=#904824>" + m_GlobalStrings.GetString("mask") + "</td>";
			sHtml = sHtml + "<td bgcolor=#904824>" + HTMLWindow.MakeLink("live://property/mask", m_sMask, m_GlobalStrings.GetString("mask-tp")) + "</td>"; 
		sHtml = sHtml + "</tr>";
		sHtml = sHtml + "</table>";
		sHtml = sHtml + "</font></body></html>";
		return sHtml;
	}
	
	public string GetPropertyType(string sPropertyId)
	{
		if(TrainUtil.HasPrefix(sPropertyId, "mounting"))return "link";
		else if(sPropertyId == "mask")return "string";
		return inherited(sPropertyId);
	}
	
	public string GetPropertyName(string sPropertyId)
	{
		if(sPropertyId == "mask") return m_GlobalStrings.GetString("mask-prop");
		return inherited(sPropertyId);
	}
	
	public string GetPropertyDescription(string sPropertyId)
	{
		if(sPropertyId == "mask") return m_GlobalStrings.GetString("mask-prop");
		return inherited(sPropertyId);
	}
	
	public string GetPropertyValue(string sPropertyId)
	{
		if(sPropertyId == "mask") return m_sMask;
		return inherited(sPropertyId);
	}
	
	public void SetPropertyValue(string sPropertyId, string sValue)
	{
		if(sPropertyId == "mask")
		{
			if(!sValue or sValue == "" or sValue == " ")sValue = m_sDefaultMask;
			m_sMask = sValue;
		}
		else inherited(sPropertyId, sValue);
	}
	
	public void LinkPropertyValue(string sPropertyId)
	{
		if(TrainUtil.HasPrefix(sPropertyId, "mounting"))
		{
			int iId = Str.ToInt(Str.Tokens(sPropertyId, "[]")[1]);
			m_iMounting = iId;
		}
		else inherited(sPropertyId);
	}
	
	public Soup GetProperties(void)
	{
		Soup _Soup = inherited();
		_Soup.SetNamedTag("m_iMounting", m_iMounting);
		_Soup.SetNamedTag("m_sMask", m_sMask);
		return _Soup;
	}
	
	public void SetProperties(Soup _Soup)
	{
		inherited(_Soup);
		m_iMounting = _Soup.GetNamedTagAsInt("m_iMounting", 0);
		
		m_sMask = _Soup.GetNamedTag("m_sMask");
		if(!m_sMask or m_sMask == "" or m_sMask == " ") m_sMask = m_sDefaultMask;
		
		int i;
		for(i = 0; i < m_asMountings.size(); i++)
		{
			SetMeshVisible(m_asMountings[i], m_iMounting == i, 0.0f);
		}
	}
	
	void LoadMountingTypes(Asset _Asset)
	{
		Soup _Config = _Asset.GetConfigSoup();
		if(!_Config)return;
		_Config = _Config.GetNamedSoup("mesh-table");
		if(!_Config)return;
		int i;
		for(i = 0; _Config.GetIndexForNamedTag("mounting_" + i) != -1; i++)
		{
			m_asMountings[i] = "mounting_" + i;
		}
	}
	
	void LoadDisplaySettings(void)
	{
		if(!m_MeshAsset)return;
		Soup _Config = m_MeshAsset.GetConfigSoup();
		if(!_Config)return;
		_Config = _Config.GetNamedSoup("extensions");
		if(!_Config)return;
		if(_Config.GetIndexForNamedTag("line_t_500479") != -1) m_sDefaultMask = _Config.GetNamedTag("line_t_500479");
		m_sDefaultMask = "X0";	
	}
	
	public void ApplyTrack(string sTrack){SetFXNameText("track_a", sTrack);SetFXNameText("track_b", sTrack);}
	public void ApplyDestination(string sDestination){SetFXNameText("dest_a", sDestination);SetFXNameText("dest_b", sDestination);}
	public void ApplyTime(string sTime){SetFXNameText("time_a", sTime);SetFXNameText("time_b", sTime);}
	public void ApplyLine(string sLine)
	{
		if(!sLine or sLine == "" or sLine == " ")
		{
			SetFXNameText("line_a", " ");
			SetFXNameText("line_b", " ");
			return;
		}
		
		string sNumbers = "";
		string sChars = "";
		
		int i;
		for(i = 0; i < sLine.size(); i++)
		{
			if(sLine[i] != '0'
			and sLine[i] != '1'
			and sLine[i] != '2'
			and sLine[i] != '3'
			and sLine[i] != '4'
			and sLine[i] != '5'
			and sLine[i] != '6'
			and sLine[i] != '7'
			and sLine[i] != '8'
			and sLine[i] != '9')continue;
			break;
		}
		
		sChars.copy(sLine);
		sNumbers.copy(sLine);
		Str.Left(sChars, i);
		Str.Right(sNumbers, sLine.size() - i);
		
		string sNewLine = "";
		if(sChars.size() > 0 and sNumbers.size() > 0)
		{
			int a;
			for(a = 0; a < m_sMask.size(); a++)
			{
				if(m_sMask[a] == 'X') sNewLine = sNewLine + sChars;
				else if(m_sMask[a] == '0') sNewLine = sNewLine + sNumbers;
				else sNewLine[sNewLine.size()] = m_sMask[a];
			}
		}
		else if(sNumbers.size() > 0) sNewLine = sNumbers;
		else if(sChars.size() > 0) sNewLine = sChars;
		else sNewLine = " ";
		
		SetFXNameText("line_a", sNewLine);
		SetFXNameText("line_b", sNewLine);
	}
	public void ClearTrack(void){ApplyTrack(" ");}
	public void ClearDestination(void){ApplyDestination(" ");}
	public void ClearTime(void){ApplyTime(" ");}
	public void ClearLine(void){ApplyLine(" ");}
};
//Ende Ergänzung externe Displays (callavsg)

// PassengerStation with adjustable waiting time
class GenPassStation_Wait isclass GenericPassengerStation
{
    int[] m_waittime;


    public void Init(void)
    {
	inherited();
	m_waittime = new int[3];
	m_waittime[0] = 4;
	m_waittime[1] = 4;
	m_waittime[2] = 4;
	// DEBUG-script initialisieren
    }
    
    
    void SetWaitingTime(int waittime, int priority)
    {
	if (priority < 1 or priority > 3)
	    return;
	if (waittime >= 10)
	    m_waittime[priority - 1] = waittime - 6;
	else
	    m_waittime[priority - 1] = 4;
    }


    bool PerformMassStoppedLoad(Vehicle vehicle, string triggerName)
    {
	if (itcPassengerStation.IsAlreadyAdded(vehicle))
	    return false;

	// Already loading everything.
	int i;

	TrackLoadInfo info = new TrackLoadInfo();
	GetTrackAndSide(vehicle, triggerName, info);
	if (!info.trackName)
	    return false;

	Interface.Log("PerformMassStoppedLoad> trainLeftSide = " + info.trainLeftSide);
    
	bool passengersLeft = (info.trainLeftSide == vehicle.GetDirectionRelativeToTrain());
	if (passengersLeft)
	    vehicle.SetDoorAnimationState("left-passenger-door", true);
	else
	    vehicle.SetDoorAnimationState("right-passenger-door", true);

	bool isFirstVehicleInThisTrain;

	isFirstVehicleInThisTrain = itcPassengerStation.AddVehicle(vehicle, false);

	if (isFirstVehicleInThisTrain)
	{
	    Train train = vehicle.GetMyTrain();
	    Vehicle[] vehicles = train.GetVehicles();

	    // Calculate waiting time
	    int waiting = m_waittime[train.GetTrainPriorityNumber() - 1];
	    Interface.Print("Waiting " + (string) (waiting + 6) + " seconds");

	    Sleep(3);

	    int doLoad = ACTION_NOTHING;
	    if (itc.IsTrainCommand(train, Industry.LOAD_COMMAND))
		doLoad = ACTION_LOADING;
	    else if (itc.IsTrainCommand(train, Industry.UNLOAD_COMMAND))
		doLoad = ACTION_UNLOADING;
      
	    // Unload first, even if loading, as we want old passengers to get off.
	    if (doLoad == ACTION_UNLOADING  or  doLoad == ACTION_LOADING)
	    {
		ProductQueue unloadQueue = GetQueue("passengers_off_" + info.platformIndex);
		PerformProductLoadAndUnload(unloadQueue, train, ACTION_UNLOADING, info);
	    }

	    // Waiting defined time
	    Sleep(waiting);

	    // Load passengers (after waiting time)
	    if (doLoad == ACTION_LOADING)
	    {
		ProductQueue loadQueue = GetQueue("passengers_on_" + info.platformIndex);
		PerformProductLoadAndUnload(loadQueue, train, ACTION_LOADING, info);
	    }

	    // Close the doors of all the vehicles.
	    for (i = 0; i < vehicles.size(); i++)
	    {
		Vehicle iVehicle = vehicles[i];
				
		if (itcPassengerStation.IsAlreadyAdded(iVehicle))
		{
		    //if (info.trainLeftSide == iVehicle.GetDirectionRelativeToTrain())
		    {
			iVehicle.SetDoorAnimationState("left-passenger-door", false);
		    }
		    //else
		    {
			iVehicle.SetDoorAnimationState("right-passenger-door", false);
		    }

		    itcPassengerStation.RemoveVehicle(iVehicle);
		}
	    }

	    Sleep(3);

	    return true;
	}

	return false;
    }

};

class Attachment
{
    public int displayType;
    public int displayMounting;
    public int signType;
    public int signMounting;
    public int lampType;
    public int lampMounting;
};

class TrackData
{
    public string trackName;
    public int trackStop;
    public bool platformLeft;
    public int count;
    public Attachment[] Attachments;
    public bool[] priorities;
};

//Beginn Ergänzung externe Displays (callavsg)
class ExternalDisplay
{
	public GameObjectID		m_UID = null;
	
	public Soup GetProperties(void)
	{
		Soup _Soup = Constructors.NewSoup();
		if(m_UID) _Soup.SetNamedTag("_UID", m_UID);
		return _Soup;
	}
	
	public void SetProperties(Soup _Soup)
	{
		if(_Soup.GetIndexForNamedTag("_UID") != -1)
		{
			m_UID = _Soup.GetNamedTagAsGameObjectID("_UID");
		}
	}
	
	public MeshObject _MeshObject(void)
	{
		if(!m_UID)return null;
		GameObject _Obj = World.GetGameObjectByIDIfLoaded(m_UID);
		if(!_Obj) _Obj = World.SynchronouslyLoadGameObjectByID(m_UID);
		if(!_Obj)return null;
		if(!_Obj.isclass(MeshObject))return null;
		return (cast<MeshObject>_Obj);
	}
	
	public MapObject _MapObject(void)
	{
		MeshObject _Mesh = _MeshObject();
		if(!_Mesh)return null;
		if(!_Mesh.isclass(MapObject))return null;
		return (cast<MapObject>_Mesh);
	}
};
//Ende Ergänzung externe Displays (callavsg)

class ESK_STATION isclass GenPassStation_Wait
{
    bool debug = false;
    void DEBUG(string text)
    {
	Interface.Log("**DEBUG** " + GetName() + " - " + text);
    }

    void DEBUGPrint(string text)
    {
	Interface.Print(GetName() + " - " + text);
    }

    string imgadd, imgremove;
    int numberOfTracks=0;
    string[] displayType;
    int[] displayLength;
	string[] displayMask;
    string[] signType;
    string[] lampType;
    int stationspeed = 0;
    int wait1 = 10, wait2 = 10, wait3 = 10;
    Asset eskLib;
    Asset nullmesh, stopMesh;
    Asset[] displayMesh;
    Asset defaultDisplayMesh;
    Asset[] signMesh;
    Asset defaultSignMesh;
    Asset[] lampMesh;
    Asset defaultLampMesh;
    KUID[] displayMeshKUID, signMeshKUID, lampMeshKUID;
    int openTrack = -1;
    string oldName = "";
    string stationName ="";

    define int STOP_START = 0;
    define int STOP_CENTER = 1;
    define int STOP_END = 2;
    define int STATIONSPEED = 18;	// 18km/h
    
    define int TYPE_NONE = 0;
    define int TYPE_A = 1;
    define int TYPE_B = 2;
    define int TYPE_C = 3;
    define int DISPLAY_MAX = TYPE_C;
    define int SIGN_MAX = TYPE_C;
    define int LAMP_MAX = TYPE_C;
    
    define int MOUNT_NONE = 0;
    define int MOUNT_POLE = 1;
    define string MOUNT_POLE_MESH = "pole";
    define int MOUNT_ROOF = 2;
    define string MOUNT_ROOF_MESH = "roof";
    define int MOUNT_WALL = 3;
    define string MOUNT_WALL_MESH = "wall";
    define int MOUNT_OTHER = 4;
    define string MOUNT_OTHER_MESH = "other";
    define int MOUNT_MAX = MOUNT_OTHER;

    float DEPARTURE_RAND_MIN=0.5;
    float DEPARTURE_RAND_MAX=3.0;
    
    // **** NEU ****
    TrackData[] Platforms;
//Beginn Ergänzung externe Displays (callavsg)
    ExternalDisplay[] m_aExtDisplays = new ExternalDisplay[0];    
//Ende Ergänzung externe Displays (callavsg)
    void SelectDisplays(int track);
    void ClearDisplays(int track);
    void SelectAllDisplays(void);
    void SelectAllSigns(void);
    void SelectAllLamps(void);
    string GetTime(float gameTime);
    void SetStopMesh(int track);
    bool HasPrefix(string searchStr, string prefixStr);


    bool TriggerSupportsMassStoppedLoad(Vehicle vehicle, string triggerName)
    {
	string[] tok=Str.Tokens(triggerName,"_");
	if (tok[0]+tok[1]!="triggertrack") return false; // Trigger hat nichts mit Bahnsteigen zu tun
	
	bool vtotrack = vehicle.GetRelationToTrack(me, "track_" + tok[2]) == Vehicle.DIRECTION_FORWARD;
	bool vtotrain = vehicle.GetDirectionRelativeToTrain();
	bool ttotrack = (vtotrack == vtotrain); 
	int stopPos = Platforms[Str.ToInt(tok[2]) - 1].trackStop;

	Vehicle[] vehicles = vehicle.GetMyTrain().GetVehicles();

	if ( stopPos == STOP_END )
	{
	    // Stop at end of track
	    if ( ( vehicle == vehicles[0] ) and ttotrack and ( tok[3] == "ende2" ) ) { return true; }
	    if ( ( vehicle == vehicles[vehicles.size()-1] ) and !ttotrack and ( tok[3] == "ende2" ) ) { return true; }
	    // in case short trains have passed trigger
	    if ( ( vehicle == vehicles[vehicles.size()-1] ) and !ttotrack and ( tok[3] == "mitte" ) ) { return true; }
	}
	else if ( stopPos == STOP_START )
	{
	    // Stop at start of track
	    if ( ( vehicle == vehicles[0] ) and !ttotrack and ( tok[3] == "ende1" ) ) { return true; }
	    if ( ( vehicle == vehicles[vehicles.size()-1] ) and ttotrack and ( tok[3] == "ende1" ) ) { return true; }
	    // in case short trains have passed trigger
	    if ( ( vehicle == vehicles[vehicles.size()-1] ) and ttotrack and ( tok[3] == "mitte" ) ) { return true; }
	}
	else if ( stopPos == STOP_CENTER ) 
	{
	    // Stop at center of track
	    int car = (vehicles.size() - 1) / 2;
	    if (tok[3] == "mitte" and vehicle == vehicles[car]) { return true; }
	}

	if (vehicle.GetMyTrain().IsStopped())
	    return true; // Wenn der Zug am Bahnsteig hält

	return false; // Sonst nicht
    }


    void GetTrackAndSide(Vehicle vehicle, string triggerName, TrackLoadInfo retInfo)
    {
	string[] tok=Str.Tokens(triggerName,"_");
	retInfo.trackName = "track_"+tok[2];
	retInfo.trainLeftSide = !(vehicle.GetRelationToTrack(me, retInfo.trackName) != Vehicle.DIRECTION_BACKWARD) == vehicle.GetDirectionRelativeToTrain();
	retInfo.platformIndex = Str.ToInt(tok[2])-1;
	if (Platforms[retInfo.platformIndex].platformLeft)
	    retInfo.trainLeftSide = !retInfo.trainLeftSide;
    }


    int FindNumberOfTracks()
    {
	int i, count = 0;
	Soup tracks = GetAsset().GetConfigSoup().GetNamedSoup("attached-track");
	for ( i = 0; i < tracks.CountTags(); i++)
	    if (HasPrefix(tracks.GetIndexedTagName(i), "track_"))
		count++;
	return count;
    }
    
    
    void FindAttachments(int track)
    {
	int i, count = 0;
	string search = "position_" + (string) (track + 1) + "_";
	Soup effects = GetAsset().GetConfigSoup().GetNamedSoup("mesh-table").GetNamedSoup("default").GetNamedSoup("effects");
	Platforms[track].Attachments = new Attachment[0];
	for ( i = 0; i < effects.CountTags(); i++)
	{
	    if (HasPrefix(effects.GetIndexedTagName(i), search))
	    {
		Platforms[track].Attachments[count] = new Attachment();
		Platforms[track].Attachments[count].displayType = TYPE_NONE;
		Platforms[track].Attachments[count].displayMounting = MOUNT_NONE;
		Platforms[track].Attachments[count].signType = TYPE_NONE;
		Platforms[track].Attachments[count].signMounting = MOUNT_NONE;
		Platforms[track].Attachments[count].lampType = TYPE_NONE;
		Platforms[track].Attachments[count].lampMounting = MOUNT_NONE;
		count++;
	    }
	}
	Platforms[track].count = count;
    }
    
    
    public void Init(void)
    {
	int i, j, mask;
	Soup stationInfo500749, configSoup;
	inherited();
	oldName = GetName();
	eskLib = GetAsset().FindAsset("esklib2");
	nullmesh = GetAsset().FindAsset("nullmesh");
	stopMesh = GetAsset().FindAsset("stopmesh");

	defaultDisplayMesh = GetAsset().FindAsset("displaymesh");
	displayMesh = new Asset[DISPLAY_MAX+1];
	displayMeshKUID = new KUID[DISPLAY_MAX+1];
	displayType = new string[DISPLAY_MAX+1];
	displayLength = new int[DISPLAY_MAX+1];
	for (i = 1; i <= DISPLAY_MAX; i++)
	{
	    displayMesh[i] = defaultDisplayMesh;
	    displayMeshKUID[i] = null;
	    displayType[i] = "default";
	    displayLength[i] = 20;
	}

	defaultSignMesh = GetAsset().FindAsset("signmesh");
	signMesh = new Asset[SIGN_MAX+1];
	signMeshKUID = new KUID[SIGN_MAX+1];
	signType = new string[SIGN_MAX+1];
	for (i = 1; i <= SIGN_MAX; i++)
	{
	    signMesh[i] = defaultSignMesh;
	    signMeshKUID[i] = null;
	    signType[i] = "default";
	}
	
	defaultLampMesh = GetAsset().FindAsset("lampmesh");
	lampMesh = new Asset[LAMP_MAX+1];
	lampMeshKUID = new KUID[LAMP_MAX+1];
	lampType = new string[LAMP_MAX+1];
	for (i = 1; i <= LAMP_MAX; i++)
	{
	    lampMesh[i] = defaultLampMesh;
	    lampMeshKUID[i] = null;
	    lampType[i] = "default";
	}
	
	configSoup = GetAsset().GetConfigSoup();
	stationInfo500749 = configSoup.GetNamedSoup("extensions").GetNamedSoup("stationinfo_500749");
	imgadd = configSoup.GetNamedSoup("kuid-table").GetNamedTagAsKUID("imgadd").GetHTMLString();
	imgremove = configSoup.GetNamedSoup("kuid-table").GetNamedTagAsKUID("imgremove").GetHTMLString();
	stationspeed = stationInfo500749.GetNamedTagAsInt("stationspeed", STATIONSPEED);
	
	numberOfTracks = FindNumberOfTracks();
	Platforms = new TrackData[numberOfTracks];
	
	for ( i = 0; i < numberOfTracks; i++)
	{
	    Platforms[i] = new TrackData();
	    Platforms[i].priorities = new bool[4];
	    Platforms[i].priorities[0] = false;
	    Platforms[i].priorities[1] = false;
	    Platforms[i].priorities[2] = true;
	    Platforms[i].priorities[3] = true;
	    Platforms[i].trackName = (string) (i + 1);
	    Platforms[i].trackStop = STOP_CENTER;
	    Platforms[i].platformLeft = (stationInfo500749.GetNamedTag("track_" + (string)(i + 1) + "_platform") == "left");
	    SetStopMesh(i + 1);
	    FindAttachments(i);
	}

	InitPassengerStation(numberOfTracks);
	m_trainLoadingSpeed = stationspeed / 3.6f;
	SetWaitingTime(wait1, 1);
	SetWaitingTime(wait2, 2);
	SetWaitingTime(wait3, 3);

	StationMain();

	//Name-Effekte am Anfang auf leer " " setzen
	SelectAllDisplays();
	SelectAllSigns();
	SelectAllLamps();

	//Handler für Displays
	AddHandler(me, "Object", "InnerEnter", "ChangePassengerInfo");
	AddHandler(me, "ApproachingTrain-206816", "", "ApproachingTrain");
    }


    public void AppendDriverDestinations(string[] destNames, string[] destTracks)
    {
	eskLib = GetAsset().FindAsset("esklib2");
	StringTable stringTable = eskLib.GetStringTable();
	int i;
	for ( i = 0; i < numberOfTracks; i++)
	{
	    destTracks[i] = "track_" + (i + 1);
	    destNames[i] = stringTable.GetString("platform") + Platforms[i].trackName;
	}
    }


    /*****************************************************************/
    /* Anzeige von weiteren Informationen am Bahnhof                 */
    /* über a.name-Effekte, gesteuert über                           */
    /* P-Dehnert-ChangeDestination-Vehicles.                         */
    /*****************************************************************/
    string[] GetTrainDestination(Vehicle vehicle)
    {
	string[] retval = new string[2];
	string temp;
	Soup vSoup;
	int i;
	
	retval[0] = "";
	retval[1] = "";

	Vehicle[] vehicles = vehicle.GetMyTrain().GetVehicles();

	for (i = 0; i < vehicles.size(); i++)
	{
	    vSoup = vehicles[i].GetProperties();
	    if (vSoup.GetIndexForNamedTag("ZielAnzeige") >= 0)
	    {
		vSoup = vSoup.GetNamedSoup("ZielAnzeige");
		temp = vSoup.GetNamedTag("sDestination");
		if (temp != "")
		{
		    retval[0] = temp;
		    retval[1] = vSoup.GetNamedTag("sLine");
		    break;
		}
	    }
	    else
	    {
		temp = vSoup.GetNamedTag("destination");
		if (temp != "")
		{
		    retval[0] = temp;
		    retval[1] = vSoup.GetNamedTag("line");
		    break;
		}
	    }
	}

	return retval;
    }
    
    bool isDigit(int char)
    {
	return ((char >= '0') and (char <= '9'));
    }
    
    string TrimLine(string line)
    {
	int i;
	string retval = line;
	if (retval.size() < 2)
	    // hoechstens 1 Zeichen
	    return retval;
	if (isDigit(retval[0]) or (retval[0] == 'S') and isDigit(retval[1]))
	    // faengt mit Ziffer an oder S gefolgt von Ziffer
	    return retval;
	// sonst Ziffern am Ende entfernen
	for (i = retval.size(); i > 1; i--)
	{
	    if (!isDigit(retval[i - 1]))
		break;
	}
	retval = retval[,i];
	return retval;
	
    }

	void ApplyLine(MeshObject _Mesh, string sLine, string sMask)
	{
		if(!sLine or sLine == "" or sLine == " ")
		{
			_Mesh.SetFXNameText("line_a", " ");
			_Mesh.SetFXNameText("line_b", " ");
			return;
		}
		
		string sNumbers = "";
		string sChars = "";
		
		int i;
		for(i = 0; i < sLine.size(); i++)
		{
			if(sLine[i] != '0'
			and sLine[i] != '1'
			and sLine[i] != '2'
			and sLine[i] != '3'
			and sLine[i] != '4'
			and sLine[i] != '5'
			and sLine[i] != '6'
			and sLine[i] != '7'
			and sLine[i] != '8'
			and sLine[i] != '9')continue;
			break;
		}
		
		sChars.copy(sLine);
		sNumbers.copy(sLine);
		Str.Left(sChars, i);
		Str.Right(sNumbers, sLine.size() - i);
		
		string sNewLine = "";
		if(sChars.size() > 0 and sNumbers.size() > 0)
		{
			int a;
			for(a = 0; a < sMask.size(); a++)
			{
				if(sMask[a] == 'X') sNewLine = sNewLine + sChars;
				else if(sMask[a] == '0') sNewLine = sNewLine + sNumbers;
				else sNewLine[sNewLine.size()] = sMask[a];
			}
		}
		else if(sNumbers.size() > 0) sNewLine = sNumbers;
		else if(sChars.size() > 0) sNewLine = sChars;
		else sNewLine = " ";
		
		_Mesh.SetFXNameText("line_a", sNewLine);
		_Mesh.SetFXNameText("line_b", sNewLine);
	}

    void DisplayDestination(int track, int priority, string line, string destination)
    {
	int d, dtype;
	string[] dest = new string[DISPLAY_MAX+1];
	
	if (Platforms[track - 1].priorities[priority])
	{
	    if(destination.size() or line.size())
	    {
		if (destination == "")
		    destination = " ";
		for (d = 1; d <= DISPLAY_MAX; d++)
		{
		    dest[d] =destination;
		    if (dest[d].size() > displayLength[d])
			dest[d] = dest[d][,displayLength[d] - 1] + ".";
		}
		
		if (line == "" or line == "@")
		    line = " ";
		else if (line[0, 1] == "@")
		    line = line[1, ];
		//line = TrimLine(line);
		//DEBUGPrint("line: '" + line + "', destination: '" + destination + "'");
		    
		//Aktuelle Zeit holen und formatieren (Trainz: Mitternacht=0.5, 12h 0/1 )
		float zeit = World.GetGameTime();

		//+Einige Minuten nach Zufallsgenerator
		float verzoegerung = Math.Rand(DEPARTURE_RAND_MIN, DEPARTURE_RAND_MAX);
		float zusatz = World.GetGameTime();
		zusatz = zusatz + (verzoegerung / 1440.0);
		string zeitAnzeige = GetTime(zusatz);

		int i;
		string mask = "X0";
		MeshObject helper, display = null;
		for ( i = 1; i <= Platforms[track - 1].count; i++)
		{
		    dtype = Platforms[track - 1].Attachments[i - 1].displayType;
		    if (dtype != TYPE_NONE)
		    {
			helper = GetFXAttachment("position_" + (string) track + "_" + (string) i);
			if (helper)
			{
			    display = helper.GetFXAttachment("display");
			    if (display)
			    {
				switch (dtype)
				{
				    case TYPE_A:
				    case TYPE_B:
				    case TYPE_C: { destination = dest[dtype]; break; }
				    default: { destination = " "; break; }
				}
				display.SetFXNameText("time_a", zeitAnzeige);
				display.SetFXNameText("time_b", zeitAnzeige);
				display.SetFXNameText("dest_a", destination);
				display.SetFXNameText("dest_b", destination);
				ApplyLine(display, line, displayMask[dtype]);
			    }
			}
			}
		    }

//Beginn Ergänzung externe Displays (callavsg)
		int a;
		MapObject _Mesh = null;
		ExternalDisplayMO _Display = null;
		for(a = 0; a < m_aExtDisplays.size(); a++)
		{
			_Mesh = m_aExtDisplays[a]._MapObject();
			if(!_Mesh)continue;
			_Display = cast<ExternalDisplayMO>_Mesh;
			if(!_Display)continue;
			_Display.ApplyTime(zeitAnzeige);
			_Display.ApplyDestination(destination);
			_Display.ApplyLine(line);
			_Mesh = null;
			_Display = null;
	}
//Ende Ergänzung externe Displays (callavsg)


	    }
	}
    }


    void ApproachingTrain(Message msg)
    {
	string[] tok = Str.Tokens(msg.minor, "|");
	if (tok.size() != 4)
	    return;
	int track = Str.ToInt(tok[0]) + 1;
	if (track < 1 or track > numberOfTracks)
	    return;
	int priority =Str.ToInt(tok[1]);
	string line = tok[2];
	if (line == ".")
	    line ="";
	string destination = tok[3];
	if (destination == ".")
	    destination = "";
	DisplayDestination(track, priority, line, destination);
    }


    void ChangePassengerInfo(Message msg)
    {
	Vehicle vehicle = cast< Vehicle >(msg.src);

	string  triggerName = FindTriggerContainingNode(vehicle.GetId(), true);
	if(!triggerName)
	    return;

	string[] teil = Str.Tokens(triggerName, "_");
	string trackNumber = teil[2];
	string trackAbc = teil[3];
	if (trackAbc != "ende1" and trackAbc != "ende2")
	    return;
	int n;
	bool isFirst, isLast;

	bool vtotrack = (vehicle.GetRelationToTrack(me, "track_" + trackNumber) == Vehicle.DIRECTION_FORWARD);
	bool vtotrain = vehicle.GetDirectionRelativeToTrain();
	bool ttotrack = (vtotrack and vtotrain) or (!vtotrack and !vtotrain);

	Train myTrain = vehicle.GetMyTrain();
	Vehicle[] vehicles = myTrain.GetVehicles();
	float speed = vehicle.GetVelocity();
	if (!vtotrain)
	    speed = - speed;
	if (speed >= 0.0f)
	{
	    isFirst = (vehicles[0] == vehicle);
	    isLast = (vehicles[vehicles.size() - 1] == vehicle);
	}
	else
	{
	    isLast = (vehicles[0] == vehicle);
	    isFirst = (vehicles[vehicles.size() - 1] == vehicle);
	    ttotrack = !ttotrack;
	}
	if( isFirst and ((trackAbc == "ende1" and ttotrack) or (trackAbc == "ende2" and !ttotrack)) )
	{
	    string[] destination_line = GetTrainDestination(vehicle);
	    DisplayDestination(Str.ToInt(trackNumber), myTrain.GetTrainPriorityNumber(), destination_line[1], destination_line[0]);
	}
	else if(isLast and ((trackAbc == "ende1" and !ttotrack) or (trackAbc == "ende2" and ttotrack)) )
	{
	    ClearDisplays(Str.ToInt(trackNumber));
	}
	else
	{
	    return;
	}
    }


    void ClearDisplays(int track)
    {
	int i;
	MeshObject helper, display;
	for ( i = 1; i <= Platforms[track - 1].count; i++)
	{
	    if (Platforms[track - 1].Attachments[i - 1].displayType != TYPE_NONE)
	    {
		helper = GetFXAttachment("position_" + (string) track + "_" + (string) i);
		if (helper)
		{
		    display = helper.GetFXAttachment("display");
		    if (display)
		    {
			display.SetFXNameText("time_a", " ");
			display.SetFXNameText("time_b", " ");
			display.SetFXNameText("dest_a", " ");
			display.SetFXNameText("dest_b", " ");
			display.SetFXNameText("line_a", " ");
			display.SetFXNameText("line_b", " ");
			display.SetFXNameText("track_a", Platforms[track - 1].trackName);
			display.SetFXNameText("track_b", Platforms[track - 1].trackName);
		    }
		}
	    }
	}


//Beginn Ergänzung externe Displays (callavsg)
		int a;
		MapObject _Mesh = null;
		ExternalDisplayMO _Display = null;
		for(a = 0; a < m_aExtDisplays.size(); a++)
		{
			_Mesh = m_aExtDisplays[a]._MapObject();
			if(!_Mesh)continue;
			_Display = cast<ExternalDisplayMO>_Mesh;
			if(!_Display)continue;
			
			_Display.ClearTime();
			_Display.ClearDestination();
			_Display.ClearLine();
			_Display.ApplyTrack(Platforms[track - 1].trackName);
			_Mesh = null;
			_Display = null;
		}
//Ende Ergänzung externe Displays (callavsg)

    }


    void SelectDisplays(int track)
    {
	int i, dtype, mounting;
	MeshObject helper, display;
	
	for ( i = 1; i <= Platforms[track - 1].count; i++)
	{
	    string helperName = "position_" + (string) track + "_" + (string) i;
	    helper = GetFXAttachment(helperName);
	    if (helper)
	    {
		dtype = Platforms[track - 1].Attachments[i - 1].displayType;
		if (dtype != TYPE_NONE)
		{
		    switch (dtype)
		    {
			case TYPE_A:
			case TYPE_B:
			case TYPE_C:
			    display = helper.SetFXAttachment("display", displayMesh[dtype]); break;
			default:
			    display = null;	// Should never happen !!
		    }
		    if (display)
		    {
			mounting = Platforms[track - 1].Attachments[i - 1].displayMounting;
			display.SetMeshVisible("default", true, 0.0f);
			display.SetMeshVisible(MOUNT_POLE_MESH, mounting == MOUNT_POLE, 0.0f);
			display.SetMeshVisible(MOUNT_ROOF_MESH, mounting == MOUNT_ROOF, 0.0f);
			display.SetMeshVisible(MOUNT_WALL_MESH, mounting == MOUNT_WALL, 0.0f);
			display.SetMeshVisible(MOUNT_OTHER_MESH, mounting == MOUNT_OTHER, 0.0f);
			// SET INFORMATION!
		    }
		}
		else
		{
		    helper.SetFXAttachment("display", nullmesh);
		}
	    }
	}
	ClearDisplays(track);
    }

    
    void SelectSigns(int track)
    {
	int i, dtype, mounting;
	MeshObject helper, sign;
	
	string name = stationName;
	if (name == "")
	    name = GetName();
	for ( i = 1; i <= Platforms[track - 1].count; i++)
	{
	    string helperName = "position_" + (string) track + "_" + (string) i;
	    helper = GetFXAttachment(helperName);
	    if (helper)
	    {
		dtype = Platforms[track - 1].Attachments[i - 1].signType;
		if (dtype != TYPE_NONE)
		{
		    switch (Platforms[track - 1].Attachments[i - 1].signType)
		    {
			case TYPE_A:
			case TYPE_B:
			case TYPE_C:
			    sign = helper.SetFXAttachment("sign", signMesh[dtype]); break;
			default:
			    sign = null;	// Should never happen !!
		    }
		    if (sign)
		    {
			mounting = Platforms[track - 1].Attachments[i - 1].signMounting;
			sign.SetMeshVisible("default", true, 0.0f);
			sign.SetMeshVisible(MOUNT_POLE_MESH, mounting == MOUNT_POLE, 0.0f);
			sign.SetMeshVisible(MOUNT_ROOF_MESH, mounting == MOUNT_ROOF, 0.0f);
			sign.SetMeshVisible(MOUNT_WALL_MESH, mounting == MOUNT_WALL, 0.0f);
			sign.SetMeshVisible(MOUNT_OTHER_MESH, mounting == MOUNT_OTHER, 0.0f);
			sign.SetFXNameText("name_a", name);
			sign.SetFXNameText("name_b", name);
		    }
		}
		else
		{
		    helper.SetFXAttachment("sign", nullmesh);
		}
	    }
	}
    }

    
    void SelectLamps(int track)
    {
	int i, dtype, mounting;
	MeshObject helper, lamp;
	for ( i = 1; i <= Platforms[track - 1].count; i++)
	{
	    string helperName = "position_" + (string) track + "_" + (string) i;
	    helper = GetFXAttachment(helperName);
	    if (helper)
	    {
		dtype = Platforms[track - 1].Attachments[i - 1].lampType;
		if (dtype != TYPE_NONE)
		{
		    switch (dtype)
		    {
			case TYPE_A:
			case TYPE_B:
			case TYPE_C:
			    lamp = helper.SetFXAttachment("lamp", lampMesh[dtype]); break;
			default:
			    lamp = null;	// Should never happen !!;
		    }
		    if (lamp)
		    {
			mounting = Platforms[track - 1].Attachments[i - 1].lampMounting;
			lamp.SetMeshVisible("default", true, 0.0f);
			lamp.SetMeshVisible(MOUNT_POLE_MESH, mounting == MOUNT_POLE, 0.0f);
			lamp.SetMeshVisible(MOUNT_ROOF_MESH, mounting == MOUNT_ROOF, 0.0f);
			lamp.SetMeshVisible(MOUNT_WALL_MESH, mounting == MOUNT_WALL, 0.0f);
			lamp.SetMeshVisible(MOUNT_OTHER_MESH, mounting == MOUNT_OTHER, 0.0f);
		    }
		}
		else
		{
		    helper.SetFXAttachment("lamp", nullmesh);
		}
	    }
	}
    }

    
    void SelectAllDisplays(void)
    {
	int i;
	for ( i = 1; i <= numberOfTracks; i++)
	    SelectDisplays(i);
    }


    void SelectAllSigns(void)
    {
	int i;
	for ( i = 1; i <= numberOfTracks; i++)
	    SelectSigns(i);
    }


    void SelectAllLamps(void)
    {
	int i;
	for ( i = 1; i <= numberOfTracks; i++)
	    SelectLamps(i);
    }


    void SetStopMesh(int track)
    {
	switch (Platforms[track - 1].trackStop)
	{
	    case STOP_START:
	    {
		SetFXAttachment("stop_" + (string) track + "_0", stopMesh);
		SetFXAttachment("stop_" + (string) track + "_1", null);
		SetFXAttachment("stop_" + (string) track + "_2", null);
		break;
	    }
	    case STOP_END:
	    {
		SetFXAttachment("stop_" + (string) track + "_0", null);
		SetFXAttachment("stop_" + (string) track + "_1", null);
		SetFXAttachment("stop_" + (string) track + "_2", stopMesh);
		break;
	    }
	    case STOP_CENTER:
	    default:
	    {
		SetFXAttachment("stop_" + (string) track + "_0", null);
		SetFXAttachment("stop_" + (string) track + "_1", stopMesh);
		SetFXAttachment("stop_" + (string) track + "_2", null);
		break;
	    }
	}
    }


    string GetTime(float gameTime)
    {
        if(gameTime > 1)
	    gameTime = gameTime - 1;

	if(gameTime > 0.5)
	    gameTime = gameTime - 0.5;
	else
	    gameTime = gameTime + 0.5;

	string zeit = "";
	float stundeF, minuteF;
	int stundeI, minuteI;

	minuteF = gameTime * 1440.0;
	stundeF = minuteF / 60.0;

	stundeI = (int) stundeF;
	minuteF = minuteF - 60 * stundeI;
	minuteI = (int) minuteF;

	if(stundeI < 10)
	    zeit = zeit + "0";

	zeit = zeit + stundeI + ":";

	if(minuteI < 10)
	    zeit = zeit + "0";

	zeit = zeit + minuteI;

	return zeit;
    }


    public string GetDescriptionHTML()
    {
	int track, i, sign, pole;
	string stop, bgcolor;
	StringTable st = eskLib.GetStringTable();
	string html = inherited();

	html = html + "<font color=#000000><table border=8 bgcolor=#70381C width=100%>";
	html = html + "<tr><td> </td><td colspan=2><b>"+ st.GetString("platform") + " </b></td></tr>";
	html = html + "<tr><td width=24> </td><td width=20%><b> " + st.GetString("number") + " </b></td>";
	html = html + "<td width=20%><b> " + st.GetString("name") + " </b></td>";
	html = html + "<td><b> " + st.GetString("stop_positions") + " </b></td></tr>";
	for (track = 1; track <= numberOfTracks; track++)
	{
	    html = html + "<tr><td bgcolor=#904824><a href=live://property/";
	    if (track == openTrack)
		html = html + "closetrack tooltip=\"" + st.GetString("html_tooltip_foldin") + "\"><img kuid='" + imgremove;
	    else
		html = html + "opentrack_" + track + " tooltip=\"" + st.GetString("html_tooltip_foldout") + "\"><img kuid='" + imgadd;
	    html = html + "' width=16 height=16></a></td><td bgcolor=#904824> " + track + ": </td>";
	    html = html + "<td bgcolor=#904824> <a href=live://property/trackname_" + track + ">" + Platforms[track - 1].trackName + "</a> </td>";
	    stop = st.GetString("start");
	    if (Platforms[track - 1].trackStop == STOP_CENTER)
		stop = st.GetString("center");
	    else if (Platforms[track- 1].trackStop == STOP_END)
		stop = st.GetString("end");
	    html = html + "<td bgcolor=#904824> <a href=live://property/trackstop_" + track + ">" + stop + "</a></td></tr>";
	    if (track == openTrack)
	    {
		html = html + "<tr><td> </td><td colspan=3>" + st.GetString("html_display") + st.GetString("html_for_priority") + ":";
		for (i = 1; i <= 3; i++)
		{
		    html = html + "&nbsp; " + (string) i + " - " + HTMLWindow.CheckBox("live://property/prdisplay_" + track + "_" + i, Platforms[track - 1].priorities[i]) + "&nbsp;";
		}
		html = html + "</td></tr>";
		html = html + "<tr><td> </td><td colspan=3><table border=8 bgcolor=#70380E>";
		html = html + "<tr><td>&nbsp;" + st.GetString("html_position") + "&nbsp;</td>";
		html = html + "<td>&nbsp;" + st.GetString("html_display") + st.GetString("html_mounting") + "&nbsp;</td>";
		html = html + "<td>&nbsp;" + st.GetString("html_sign") + st.GetString("html_mounting") + "&nbsp;</td>";
		html = html + "<td>&nbsp;" + st.GetString("html_lamp") + st.GetString("html_mounting") + "&nbsp;</td></tr>";
		for (i = 1; i <= Platforms[track - 1].count; i++)
		{
		    if (i % 2)
			bgcolor = "#904812";
		    else
			bgcolor = "#884411";
		    html = html + "<tr><td bgcolor=" + bgcolor +">" + i + "&nbsp;";
		    if (i == 1)
			html = html + "(A)";
		    else if (i == Platforms[track - 1].count)
			html = html + "(B)";
		    html = html + "&nbsp;</td>";
		    html = html + "<td bgcolor=" + bgcolor +">&nbsp;<a href=live://property/display_" + track + "_" + i + ">";
		    switch (Platforms[track - 1].Attachments[i - 1].displayType)
		    {
			case TYPE_A: { html = html + st.GetString("html_type_a"); break; }
			case TYPE_B: { html = html + st.GetString("html_type_b"); break; }
			case TYPE_C: { html = html + st.GetString("html_type_c"); break; }
			default: html = html + st.GetString("html_none");
		    }
		    html = html + "</a>&nbsp;(<a href=live://property/displaypole_" + track + "_" + i + ">";
		    switch (Platforms[track - 1].Attachments[i - 1].displayMounting)
		    {
			case MOUNT_POLE: { html = html + st.GetString("html_pole"); break; }
			case MOUNT_WALL: { html = html + st.GetString("html_wall"); break; }
			case MOUNT_ROOF: { html = html + st.GetString("html_roof"); break; }
			case MOUNT_OTHER: { html = html + st.GetString("html_other"); break; }
			default: html = html + st.GetString("html_none");
		    }
		    html = html +"</a>)&nbsp;</td>";
		    html = html + "<td bgcolor=" + bgcolor +">&nbsp;<a href=live://property/sign_" + track + "_" + i + ">";
		    switch (Platforms[track - 1].Attachments[i - 1].signType)
		    {
			case TYPE_A: { html = html + st.GetString("html_type_a"); break; }
			case TYPE_B: { html = html + st.GetString("html_type_b"); break; }
			case TYPE_C: { html = html + st.GetString("html_type_c"); break; }
			default: html = html + st.GetString("html_none1");
		    };
		    html = html + "</a>&nbsp;(<a href=live://property/signpole_" + track + "_" + i + ">";
		    switch (Platforms[track - 1].Attachments[i - 1].signMounting)
		    {
			case MOUNT_POLE: { html = html + st.GetString("html_pole"); break; }
			case MOUNT_WALL: { html = html + st.GetString("html_wall"); break; }
			case MOUNT_ROOF: { html = html + st.GetString("html_roof"); break; }
			case MOUNT_OTHER: { html = html + st.GetString("html_other"); break; }
			default: html = html + st.GetString("html_none");
		    }
		    html = html +"</a>)&nbsp;</td>";
		    html = html + "<td bgcolor=" + bgcolor +">&nbsp;<a href=live://property/lamp_" + track + "_" + i + ">";
		    switch (Platforms[track - 1].Attachments[i - 1].lampType)
		    {
			case TYPE_A: { html = html + st.GetString("html_type_a"); break; }
			case TYPE_B: { html = html + st.GetString("html_type_b"); break; }
			case TYPE_C: { html = html + st.GetString("html_type_c"); break; }
			default: html = html + st.GetString("html_none1");
		    };
		    html = html + "</a>&nbsp;(<a href=live://property/lamppole_" + track + "_" + i + ">";
		    switch (Platforms[track - 1].Attachments[i - 1].lampMounting)
		    {
			case MOUNT_POLE: { html = html + st.GetString("html_pole"); break; }
			case MOUNT_WALL: { html = html + st.GetString("html_wall"); break; }
			case MOUNT_ROOF: { html = html + st.GetString("html_roof"); break; }
			case MOUNT_OTHER: { html = html + st.GetString("html_other"); break; }
			default: html = html + st.GetString("html_none");
		    }
		    html = html +"</a>)&nbsp;</td></tr>";
		}
		html = html + "</table></td></tr>";
	    }
	}
	html = html + "</table><br>";
	html = html + "<table width=100% border=8 bgcolor=#70381C>";
	html = html + "<tr><td><b>" + st.GetString("stationname") + ": </b><a href=live://property/stationname> &nbsp;";
	if (stationName == "")
	    html = html + "??????";
	else
	    html = html + stationName;
	html = html + "</a>&nbsp;&nbsp;&nbsp;<a href=live://property/useobjectname>(" + st.GetString("useobjectname") + ")</a></td></tr>";
	html = html + "<tr><td><b>" + st.GetString("waitingtime");
	html = html + st.GetString("priority") + "1: </b> <a href=live://property/wait1> " + (string) wait1 + "</a> s";
	html = html + ", <b>" + st.GetString("priority") + "2: </b> <a href=live://property/wait2>" + (string) wait2 + "</a> s";
	html = html + ", <b>" + st.GetString("priority") + "3: </b> <a href=live://property/wait3>" + (string) wait3 + "</a> s</td></tr>";
	html = html + "<tr><td><b>" + st.GetString("stationspeed") + ": </b> <a href=live://property/stationspeed>" + (string) stationspeed + "</a> km/h";
	html = html + " (<a href=live://property/stationspeed_default>" + st.GetString("default") + "</a>)</td></tr>";
	html = html + "<tr><td> </td></tr>";
	html = html + "<tr><td><b>" + st.GetString("display_type") + " A: </b><a href=live://property/displaytype_a>" + displayType[TYPE_A] + "</a></td></tr>";
	html = html + "<tr><td><b>" + st.GetString("display_type") + " B: </b><a href=live://property/displaytype_b>" + displayType[TYPE_B] + "</a></td></tr>";
	html = html + "<tr><td><b>" + st.GetString("display_type") + " C: </b><a href=live://property/displaytype_c>" + displayType[TYPE_C] + "</a></td></tr>";
	html = html + "<tr><td> </td></tr>";
	html = html + "<tr><td><b>" + st.GetString("sign_type") + " A: </b><a href=live://property/signtype_a>" + signType[TYPE_A] + "</a></td></tr>";
	html = html + "<tr><td><b>" + st.GetString("sign_type") + " B: </b><a href=live://property/signtype_b>" + signType[TYPE_B] + "</a></td></tr>";
	html = html + "<tr><td><b>" + st.GetString("sign_type") + " C: </b><a href=live://property/signtype_c>" + signType[TYPE_C] + "</a></td></tr>";
	html = html + "<tr><td> </td></tr>";
	html = html + "<tr><td><b>" + st.GetString("lamp_type") + " A: </b><a href=live://property/lamptype_a>" + lampType[TYPE_A] + "</a></td></tr>";
	html = html + "<tr><td><b>" + st.GetString("lamp_type") + " B: </b><a href=live://property/lamptype_b>" + lampType[TYPE_B] + "</a></td></tr>";
	html = html + "<tr><td><b>" + st.GetString("lamp_type") + " C: </b><a href=live://property/lamptype_c>" + lampType[TYPE_C] + "</a></td></tr>";
	html = html + "</table><br></font>";

//Beginn Ergänzung externe Displays (callavsg)
	html = html + "<font color=#000000><table width=100% cellspacing=2 cellpadding=2 bgcolor=#70381C>";
	html = html + "<tr>";
		html = html + "<td bgcolor=#904824 colspan=2><b>" + st.GetString("external-displays") + "</b></td>";
	html = html + "</tr>";
	
	int c;
	MapObject _Mo = null;
	for(c = 0; c < m_aExtDisplays.size(); c++)
	{
		_Mo = m_aExtDisplays[c]._MapObject();
		if(!_Mo)continue;
		html = html + "<tr>";
		html = html + "<td bgcolor=#904824>" + HTMLWindow.MakeLink("live://property/ExtDisplay[" + c + "]", _Mo.GetLocalisedName(), st.GetString("display-edit-tp")) + "</td>"; 
		html = html + "<td bgcolor=#904824>" + HTMLWindow.MakeLink("live://property/ExtDelete[" + c + "]", st.GetString("display-delete"), st.GetString("display-delete-tp")) + "</td>";
		html = html + "</tr>";
	}
	
	html = html + "<tr>";
		html = html + "<td bgcolor=#904824 colspan=2>" + HTMLWindow.MakeLink("live://property/ExtAdd", st.GetString("display-add"), st.GetString("display-add-tp")) + "</td>";
	html = html + "</tr>";
	html = html + "</table></font><br>&nbsp;";

//Ende Ergänzung externe Displays (callavsg)

	return html;
    }


    public string GetPropertyType(string id)
    {
	if (HasPrefix(id, "display_") or HasPrefix(id, "displaypole_") or HasPrefix(id, "sign_") or HasPrefix(id, "signpole_") or HasPrefix(id, "lamp_") or HasPrefix(id, "lamppole_")
	    or HasPrefix(id, "trackstop_") or HasPrefix(id, "prdisplay_") or HasPrefix(id, "opentrack_") or (id == "closetrack") or (id == "stationspeed_default")
	    or (id == "useobjectname") )
	    return "link";
	if (HasPrefix(id, "trackname_") or (id == "stationname") )
	    return "string";
	if (id == "displaytype_a" or id == "displaytype_b" or id == "displaytype_c" or id == "signtype_a" or id == "signtype_b" or id == "signtype_c"
	     or id == "lamptype_a" or id == "lamptype_b" or id == "lamptype_c")
	    return "list,1";
	if (id == "stationspeed")
	    return "int,5,50";
	if (id == "wait1" or id == "wait2" or id == "wait3")
	    return "int,10,300";

//Beginn Ergänzung externe Displays (callavsg)
	if(id == "ExtAdd") return "map-object,SY";
	if(TrainUtil.HasPrefix(id, "ExtDisplay"))return "map-object,SY";
	if(TrainUtil.HasPrefix(id, "ExtDelete"))return "link";
//Ende Ergänzung externe Displays (callavsg)

	return inherited(id);
    }

//Beginn Ergänzung externe Displays (callavsg)
	bool CheckObjectDisplay(GSObject[] _aObjs, string[] _asNames)
	{
		int i;
		GameObjectID _ID = null;
		GameObject _GO = null;
		for(i = 0; i < _aObjs.size(); i++)
		{
			_ID = cast<GameObjectID>_aObjs[i];
			if(!_ID)
			{
				_aObjs[i, i+1] = null;
				_asNames[i, i+1] = null;
				return true;
				break;
			}
			
			_GO = World.GetGameObjectByIDIfLoaded(_ID);
			if(!_GO) _GO = World.SynchronouslyLoadGameObjectByID(_ID);
			if(!_GO)
			{
				_aObjs[i, i+1] = null;
				_asNames[i, i+1] = null;
				return true;
				break;
			}
			
			if(!_GO.isclass(ExternalDisplayMO))
			{
				_aObjs[i, i+1] = null;
				_asNames[i, i+1] = null;
				return true;
				break;
			}
		}
		return false;
	}
		
	public bool FilterPropertyElementList(string propertyID, GSObject[] listObjects, string[] listNames)
	{
		if(TrainUtil.HasPrefix(propertyID, "ExtDisplay")
		or propertyID == "ExtAdd")
		{
			while(CheckObjectDisplay(listObjects, listNames))
			{
				// Nothing to do here
			}
			return true;
		}
		return false;
	}
	
	public void SetPropertyValue(string propertyID, GSObject value, string readableName)
	{
		if(TrainUtil.HasPrefix(propertyID, "ExtDisplay"))
		{
			int iId = Str.ToInt(Str.Tokens(propertyID, "[]")[1]);
			m_aExtDisplays[iId].m_UID = cast<GameObjectID>value;
		}
		else if(propertyID == "ExtAdd")
		{
			int iNew = m_aExtDisplays.size();
			m_aExtDisplays[iNew] = new ExternalDisplay();
			m_aExtDisplays[iNew].m_UID = cast<GameObjectID>value;
		}
	}
//Ende Ergänzung externe Displays (callavsg)

    public string GetPropertyName(string id)
    {
	StringTable st = eskLib.GetStringTable();
	if (HasPrefix(id, "display_"))
	    return st.GetString("html_display");
	if (HasPrefix(id, "trackname_"))
	    return st.GetString("platform_number");
	if (id == "displaytype_a" or id == "displaytype_b" or id == "displaytype_c")
	    return st.GetString("display_type");
	if (id == "signtype_a" or id == "signtype_b" or id == "signtype_c")
	    return st.GetString("sign_type");
	if (id == "lamptype_a" or id == "lamptype_b" or id == "lamptype_c")
	    return st.GetString("lamp_type");
	if (id == "stationspeed")
	    return st.GetString("stationspeed") + "(5 - 50)";
	if (id == "stationname")
	    return st.GetString("stationname");
	if (id == "wait1" or id == "wait2" or id == "wait3")
	    return st.GetString("waitingtime") + st.GetString("priority") + id[4, 5] +", 10 - 300 s";

//Beginn Ergänzung externe Displays (callavsg)
	if(TrainUtil.HasPrefix(id, "ExtDisplay"))return st.GetString("display-edit-prop");
	if(TrainUtil.HasPrefix(id, "ExtAdd"))return st.GetString("display-add-prop");
//Ende Ergänzung externe Displays (callavsg)

	return inherited(id);
    }


    public string GetPropertyDescription(string id)
    {
	StringTable st = eskLib.GetStringTable();
	if (HasPrefix(id, "display_"))
	    return st.GetString("html_display");
	if (HasPrefix(id, "trackname_"))
	    return st.GetString("platform_number");
	if (id == "displaytype_a" or id == "displaytype_b" or id == "displaytype_c")
	    return st.GetString("display_type");
	if (id == "signtype_a" or id == "signtype_b" or id == "signtype_c")
	    return st.GetString("sign_type");
	if (id == "lamptype_a" or id == "lamptype_b" or id == "lamptype_c")
	    return st.GetString("lamp_type");
	if (id == "stationspeed")
	    return st.GetString("stationspeed");
	if (id == "stationname")
	    return st.GetString("stationname");
	if (id == "wait1" or id == "wait2" or id == "wait3")
	    return st.GetString("waitingtime");

//Beginn Ergänzung externe Displays (callavsg)
	if(TrainUtil.HasPrefix(id, "ExtDisplay"))return st.GetString("display-edit-prop");
	if(TrainUtil.HasPrefix(id, "ExtAdd"))return st.GetString("display-add-prop");
//Ende Ergänzung externe Displays (callavsg)

	return inherited(id);
    }


    
    int GetMeshList(string type, Asset[] resultlist)
    {
	int i, retval;
	int[] filtertype = new int[6];
	string[] filterval = new string[6];
	filtertype[0] = TrainzAssetSearch.FILTER_KEYWORD; filterval[0] = "eSKA";
	filtertype[1] = TrainzAssetSearch.FILTER_AND;
	filtertype[2] = TrainzAssetSearch.FILTER_LOCATION; filterval[2] = "local";
	filtertype[3] = TrainzAssetSearch.FILTER_OR;
	filtertype[4] = TrainzAssetSearch.FILTER_LOCATION; filterval[4] = "builtin";
	filtertype[5] = TrainzAssetSearch.FILTER_VALID; filterval[5] = "true";
	Asset[] assets = TrainzAssetSearch.SearchAssets(filtertype, filterval);
	for ( i = 0; i < assets.size(); i++)
	{
	    if (assets[i].GetConfigSoup().GetNamedSoup("extensions").GetNamedTagAsInt(type,0) > 0)
	    {
		 resultlist[resultlist.size()] = assets[i]; retval++;
	    }
	}	
	return retval;
    }


    void SetPropertyValue(string propertyID, string value, int valueIndex)
    {
	int xtype;
	Asset[] meshes = new Asset[0];
	if (propertyID == "displaytype_a" or propertyID == "displaytype_b" or propertyID == "displaytype_c")
	{
	    if (propertyID == "displaytype_a")
		xtype = TYPE_A;
	    else  if (propertyID == "displaytype_b")
		xtype = TYPE_B;
	    else
		xtype = TYPE_C;
	    
	    if (value == "default")
	    {
		displayMeshKUID[xtype] = null;
		displayMesh[xtype] = defaultDisplayMesh;
		displayType[xtype] = value;
		SelectAllDisplays();
	    }
	    else
	    {
		GetMeshList("display_500749", meshes);
		int i = 0;
		while ( i < meshes.size() )
		{
		    if (meshes[i].GetLocalisedName() == value)
		    {
			displayMeshKUID[xtype] = meshes[i].GetKUID();
			displayMesh[xtype] = meshes[i];
			displayType[xtype] = value;
			SelectAllDisplays();
			break;
		    }
		    i++;
		}
	    }
	    return;
	}
	if (propertyID == "signtype_a" or propertyID == "signtype_b" or propertyID == "signtype_c")
	{
	    if (propertyID == "signtype_a")
		xtype = TYPE_A;
	    else  if (propertyID == "signtype_b")
		xtype = TYPE_B;
	    else
		xtype = TYPE_C;
	    
	    if (value == "default")
	    {
		signMeshKUID[xtype] = null;
		signMesh[xtype] = defaultSignMesh;
		signType[xtype] = value;
		SelectAllSigns();
	    }
	    else
	    {
		GetMeshList("stationsign_500749", meshes);
		int i = 0;
		while ( i < meshes.size() )
		{
		    if (meshes[i].GetLocalisedName() == value)
		    {
			signMeshKUID[xtype] = meshes[i].GetKUID();
			signMesh[xtype] = meshes[i];
			signType[xtype] = value;
			SelectAllSigns();
			break;
		    }
		    i++;
		}
	    }
	    return;
	}
	if (propertyID == "lamptype_a" or propertyID == "lamptype_b" or propertyID == "lamptype_c")
	{
	    if (propertyID == "lamptype_a")
		xtype = TYPE_A;
	    else  if (propertyID == "lamptype_b")
		xtype = TYPE_B;
	    else
		xtype = TYPE_C;
	    
	    if (value == "default")
	    {
		lampMeshKUID[xtype] = null;
		lampMesh[xtype] = defaultLampMesh;
		lampType[xtype] = value;
		SelectAllLamps();
	    }
	    else
	    {
		GetMeshList("stationlamp_500749", meshes);
		int i = 0;
		while ( i < meshes.size() )
		{
		    if (meshes[i].GetLocalisedName() == value)
		    {
			lampMeshKUID[xtype] = meshes[i].GetKUID();
			lampMesh[xtype] = meshes[i];
			lampType[xtype] = value;
			SelectAllLamps();
			break;
		    }
		    i++;
		}
	    }
	    return;
	}
	inherited(propertyID, value, valueIndex);
    }


    void SetPropertyValue(string propertyID, int value)
    {
	if (propertyID == "stationspeed")
	{
	    stationspeed = value;
	    m_trainLoadingSpeed = stationspeed / 3.6f;
	}
	else if (propertyID == "wait1")
	{
	    wait1 = value;
	    if (wait1 < 10)
		wait1 = 10;
	    SetWaitingTime(wait1, 1);
	}
	else if (propertyID == "wait2")
	{
	    wait2 = value;
	    if (wait2 < 10)
		wait2 = 10;
	    SetWaitingTime(wait2, 2);
	}
	else if (propertyID == "wait3")
	{
	    wait3 = value;
	    if (wait3 < 10)
		wait3 = 10;
	    SetWaitingTime(wait3, 3);
	}
	else if (HasPrefix(propertyID, "trackname_"))
	{
	    string[] tok = Str.Tokens(propertyID, "_");
	    if (tok.size() == 2)
	    {
		int track = Str.ToInt(tok[1]);
		if (track <= numberOfTracks)
		{
		    Platforms[track - 1].trackName = value;
		    ClearDisplays(track);
		}
	    }
	}
	else
	    inherited(propertyID, value);
    }


    void SetPropertyValue(string propertyID, string value)
    {
	if (HasPrefix(propertyID, "trackname_"))
	{
	    string[] tok = Str.Tokens(propertyID, "_");
	    if (tok.size() == 2)
	    {
		int track = Str.ToInt(tok[1]);
		if (track <= numberOfTracks)
		{
		    Platforms[track - 1].trackName = value;
		    ClearDisplays(track);
		}
	    }
	}
	else if (propertyID == "stationname")
	{
	    stationName = value;
	    SelectAllSigns();
	}
	else
	    inherited(propertyID, value);
    }


    public string GetPropertyValue(string propertyID)
    {
	if (propertyID == "stationname")
	    return stationName;
	if (propertyID == "wait1")
	    return (string) wait1;
	if (propertyID == "wait2")
	    return (string) wait2;
	if (propertyID == "wait3")
	    return (string) wait3;
	if (propertyID == "stationspeed")
	    return (string) stationspeed;
	return inherited(propertyID);
    }


    public string[] GetPropertyElementList(string propertyID)
    {
	Asset[] meshes = new Asset[0];
	if (propertyID == "displaytype_a" or propertyID == "displaytype_b" or propertyID == "displaytype_c")
	{
	    string[] retval = new string[0];
	    retval[0] = "default";
	    GetMeshList("display_500749", meshes);
	    int i = 0;
	    while ( i < meshes.size() )
	    {
		retval[retval.size()] = meshes[i].GetLocalisedName();
		i++;
	    }
	    return retval;
	}
	if (propertyID == "signtype_a" or propertyID == "signtype_b" or propertyID == "signtype_c")
	{
	    string[] retval = new string[0];
	    retval[0] = "default";
	    GetMeshList("stationsign_500749",meshes);
	    int i = 0;
	    while ( i < meshes.size() )
	    {
		retval[retval.size()] = meshes[i].GetLocalisedName();
		i++;
	    }
	    return retval;
	}
	if (propertyID == "lamptype_a" or propertyID == "lamptype_b" or propertyID == "lamptype_c")
	{
	    string[] retval = new string[0];
	    retval[0] = "default";
	    GetMeshList("stationlamp_500749", meshes);
	    int i = 0;
	    while ( i < meshes.size() )
	    {
		retval[retval.size()] = meshes[i].GetLocalisedName();
		i++;
	    }
	    return retval;
	}
	return inherited(propertyID);
    }
    

    void LinkPropertyValue(string id)
    {
	int track, position, mounting, priority;
	string[] tok;
	if (HasPrefix(id, "prdisplay_"))
	{
	    tok = Str.Tokens(id, "_");
	    if (tok.size() == 3)
	    {
		track = Str.ToInt(tok[1]) - 1;
		priority = Str.ToInt(tok[2]);
		Platforms[track].priorities[priority] = !Platforms[track].priorities[priority];
	    }
	}
	else if (HasPrefix(id, "display_"))
	{
	    tok = Str.Tokens(id, "_");
	    if (tok.size() == 3)
	    {
		track = Str.ToInt(tok[1]) - 1;
		position = Str.ToInt(tok[2]) - 1;
		Platforms[track].Attachments[position].displayType++;
		switch (Platforms[track].Attachments[position].displayType)
		{
		    case TYPE_A: Platforms[track].Attachments[position].displayMounting = MOUNT_POLE;
		    case TYPE_B:
		    case TYPE_C: break;
		    default:
		    {
			Platforms[track].Attachments[position].displayMounting = MOUNT_NONE;
			Platforms[track].Attachments[position].displayType = TYPE_NONE;
			break;
		    }
		}
		SelectDisplays(track + 1);
	    }
	}
	else if (HasPrefix(id, "displaypole_"))
	{
	    tok = Str.Tokens(id, "_");
	    if (tok.size() == 3)
	    {
		track = Str.ToInt(tok[1]) - 1;
		position = Str.ToInt(tok[2]) - 1;
		if (Platforms[track].Attachments[position].displayType)
		{
		    mounting = Platforms[track].Attachments[position].displayMounting + 1;
		    if (mounting > MOUNT_MAX)
			mounting = MOUNT_NONE;
		    Platforms[track].Attachments[position].displayMounting = mounting;
		    SelectDisplays(track + 1);
		}
	    }
	}
	else if (HasPrefix(id, "sign_"))
	{
	    tok = Str.Tokens(id, "_");
	    if (tok.size() == 3)
	    {
		track = Str.ToInt(tok[1]) - 1;
		position= Str.ToInt(tok[2]) - 1;
		Platforms[track].Attachments[position].signType++;
		switch (Platforms[track].Attachments[position].signType)
		{
		    case TYPE_A: Platforms[track].Attachments[position].signMounting = MOUNT_POLE;
		    case TYPE_B:
		    case TYPE_C: break;
		    default:
		    {
			Platforms[track].Attachments[position].signMounting = MOUNT_NONE;
			Platforms[track].Attachments[position].signType = TYPE_NONE;
			break;
		    }
		}
		SelectSigns(track + 1);
	    }
	}
	else if (HasPrefix(id, "signpole_"))
	{
	    tok = Str.Tokens(id, "_");
	    if (tok.size() == 3)
	    {
		track = Str.ToInt(tok[1]) - 1;
		position = Str.ToInt(tok[2]) - 1;
		if (Platforms[track].Attachments[position].signType)
		{
		    mounting = Platforms[track].Attachments[position].signMounting + 1;
		    if (mounting > MOUNT_MAX)
			mounting = MOUNT_NONE;
		    Platforms[track].Attachments[position].signMounting = mounting;
		    SelectSigns(track + 1);
		}
	    }
	}
	else if (HasPrefix(id, "lamp_"))
	{
	    tok = Str.Tokens(id, "_");
	    if (tok.size() == 3)
	    {
		track = Str.ToInt(tok[1]) - 1;
		position= Str.ToInt(tok[2]) - 1;
		Platforms[track].Attachments[position].lampType++;
		switch (Platforms[track].Attachments[position].lampType)
		{
		    case TYPE_A: Platforms[track].Attachments[position].lampMounting = MOUNT_POLE;
		    case TYPE_B:
		    case TYPE_C: break;
		    default:
		    {
			Platforms[track].Attachments[position].lampMounting = MOUNT_NONE;
			Platforms[track].Attachments[position].lampType = TYPE_NONE;
			break;
		    }
		}
		SelectLamps(track + 1);
	    }
	}
	else if (HasPrefix(id, "lamppole_"))
	{
	    tok = Str.Tokens(id, "_");
	    if (tok.size() == 3)
	    {
		track = Str.ToInt(tok[1]) - 1;
		position = Str.ToInt(tok[2]) - 1;
		if (Platforms[track].Attachments[position].lampType)
		{
		    mounting = Platforms[track].Attachments[position].lampMounting + 1;
		    if (mounting > MOUNT_MAX)
			mounting = MOUNT_NONE;
		    Platforms[track].Attachments[position].lampMounting = mounting;
		    SelectLamps(track + 1);
		}
	    }
	}
	else if (HasPrefix(id, "trackstop_"))
	{
	    tok = Str.Tokens(id, "_");
	    if (tok.size() == 2)
	    {
		track = Str.ToInt(tok[1]) - 1;
		Platforms[track].trackStop++;
		if (Platforms[track].trackStop > STOP_END)
		    Platforms[track].trackStop = STOP_START;
		SetStopMesh(track + 1);
	    }
	}
	else if (HasPrefix(id, "opentrack_"))
	{
	    tok = Str.Tokens(id, "_");
	    if (tok.size() == 2)
		openTrack = Str.ToInt(tok[1]);
	}
	else if (id == "closetrack")
	    openTrack = -1;
	else if (id == "stationspeed_default")
	{
	    Soup stationInfo500749 = GetAsset().GetConfigSoup().GetNamedSoup("extensions").GetNamedSoup("stationinfo_500749");
	    stationspeed = stationInfo500749.GetNamedTagAsInt("stationspeed", STATIONSPEED);
	    m_trainLoadingSpeed = stationspeed / 3.6f;
	}
	else if (id == "useobjectname")
	{
	    stationName = GetName();
	    SelectAllSigns();
	}

//Beginn Ergänzung externe Displays (callavsg)
	else if(TrainUtil.HasPrefix(id, "ExtDelete"))
	{
		int iId = Str.ToInt(Str.Tokens(id, "[]")[1]);
		m_aExtDisplays[iId, iId+1] = null;
	}
//Ende Ergänzung externe Displays (callavsg)

	else 
	    inherited(id);
    }


    public Soup GetProperties()
    {
	Soup soup = inherited();

	int i, j, t;
	string tn;
	
	soup.SetNamedTag("stationspeed", stationspeed);
	soup.SetNamedTag("stationname", stationName);
	soup.SetNamedTag("wait1", wait1);
	soup.SetNamedTag("wait2", wait2);
	soup.SetNamedTag("wait3", wait3);
	if (displayMeshKUID[TYPE_A])
		soup.SetNamedTag("displaymeshakuid", displayMeshKUID[TYPE_A]);
	if (displayMeshKUID[TYPE_B])
		soup.SetNamedTag("displaymeshbkuid", displayMeshKUID[TYPE_B]);
	if (displayMeshKUID[TYPE_C])
		soup.SetNamedTag("displaymeshckuid", displayMeshKUID[TYPE_C]);
	if (signMeshKUID[TYPE_A])
	    soup.SetNamedTag("signmeshakuid", signMeshKUID[TYPE_A]);
	if (signMeshKUID[TYPE_B])
	    soup.SetNamedTag("signmeshbkuid", signMeshKUID[TYPE_B]);
	if (signMeshKUID[TYPE_C])
	    soup.SetNamedTag("signmeshckuid", signMeshKUID[TYPE_C]);
	if (lampMeshKUID[TYPE_A])
	    soup.SetNamedTag("lampmeshakuid", lampMeshKUID[TYPE_A]);
	if (lampMeshKUID[TYPE_B])
	    soup.SetNamedTag("lampmeshbkuid", lampMeshKUID[TYPE_B]);
	if (lampMeshKUID[TYPE_C])
	    soup.SetNamedTag("lampmeshckuid", lampMeshKUID[TYPE_C]);
	for ( i = 0; i < numberOfTracks; i++)
	{
	    soup.SetNamedTag("trackname_" + (string) i, Platforms[i].trackName);
	    soup.SetNamedTag("trackstop_" + (string) i, Platforms[i].trackStop);
	    for ( j = 0; j <= 3; j++)
	    {
		soup.SetNamedTag("prdisplay_" + (string) i + "_" + (string) j, Platforms[i].priorities[j]);
	    }
	    for ( j = 0; j < Platforms[i].count; j++)
	    {
		soup.SetNamedTag("displayType_" + (string) i + "_" + (string) j, Platforms[i].Attachments[j].displayType);
		soup.SetNamedTag("displayMounting_" + (string) i + "_" + (string) j, Platforms[i].Attachments[j].displayMounting);
		soup.SetNamedTag("signmask_" + (string) i + "_" + (string) j, Platforms[i].Attachments[j].signType);
		soup.SetNamedTag("signMounting_" + (string) i + "_" + (string) j, Platforms[i].Attachments[j].signMounting);
		soup.SetNamedTag("lampType_" + (string) i + "_" + (string) j, Platforms[i].Attachments[j].lampType);
		soup.SetNamedTag("lampMounting_" + (string) i + "_" + (string) j, Platforms[i].Attachments[j].lampMounting);
	    }
	}

//Beginn Ergänzung externe Displays (callavsg)
	int c;
	for(c = 0; c < m_aExtDisplays.size(); c++)
	{
		soup.SetNamedSoup("ExtDisplay[" + c + "]", m_aExtDisplays[c].GetProperties());
	}
//Ende Ergänzung externe Displays (callavsg)

	return soup;
    }


    public void SetProperties(Soup p)
    {
	inherited(p);

	int i, j, bit;
	string n;
	int xtype;
	string xstring;

	stationName = p.GetNamedTag("stationname");
	if (p.GetIndexForNamedTag("stationspeed") >= 0)
	{
	    stationspeed = p.GetNamedTagAsInt("stationspeed", STATIONSPEED);
	    m_trainLoadingSpeed = stationspeed / 3.6f;
	}
	if (p.GetIndexForNamedTag("wait1") >= 0)
	{
	    wait1 = p.GetNamedTagAsInt("wait1", 10);
	    if (wait1 < 10)
		wait1 = 10;
	}
	if (p.GetIndexForNamedTag("wait2") >= 0)
	{
	    wait2 = p.GetNamedTagAsInt("wait2", 10);
	    if (wait2 < 10)
		wait2 = 10;
	}
	if (p.GetIndexForNamedTag("wait3") >= 0)
	{
	    wait3 = p.GetNamedTagAsInt("wait3", 10);
	    if (wait3 < 10)
		wait3 = 10;
	}
	SetWaitingTime(wait1, 1);
	SetWaitingTime(wait2, 2);
	SetWaitingTime(wait3, 3);

	displayMask = new string[0];
	for (xtype = 1; xtype <= DISPLAY_MAX; xtype ++)
	{
	    switch (xtype)
	    {
		case TYPE_A: { xstring = "displaymeshakuid"; break; }
		case TYPE_B: { xstring = "displaymeshbkuid"; break; }
		case TYPE_C: { xstring = "displaymeshckuid"; break; }
		default: { break; }
	    }
	    displayMeshKUID[xtype] = null;
	    KUID new_displayMeshKUID = p.GetNamedTagAsKUID(xstring);
	    if (new_displayMeshKUID)
	    {
		displayMeshKUID[xtype] = new_displayMeshKUID;
		displayMesh[xtype] = World.FindAsset(displayMeshKUID[xtype]);
		displayType[xtype] = displayMesh[xtype].GetLocalisedName();
		if (displayType[xtype].size() < 1)
		{
		    Interface.Log ("! WARNUNG ! " + GetName() + " - Display " + displayMeshKUID[xtype].GetLogString() + " nicht gefunden");
		    displayMeshKUID[xtype] = null;
		}
	    }
	    if (displayMeshKUID[xtype] == null)
	    {
		displayMesh[xtype] = defaultDisplayMesh;
		displayType[xtype] = "default";
	    }
		Soup _Config = displayMesh[xtype].GetConfigSoup();
		if(!_Config)continue;
		_Config = _Config.GetNamedSoup("extensions");
		if(!_Config)continue;
	    displayLength[xtype] = _Config.GetNamedTagAsInt("display_500749", 20);
		displayMask[xtype] = _Config.GetNamedTag("line_t_500479");
		if(!displayMask[xtype] or displayMask[xtype] == "" or displayMask[xtype] == " ") displayMask[xtype] = "X0";
	}

	for (xtype = 1; xtype <= SIGN_MAX; xtype ++)
	{
	    switch (xtype)
	    {
		case TYPE_A: { xstring = "signmeshakuid"; break; }
		case TYPE_B: { xstring = "signmeshbkuid"; break; }
		case TYPE_C: { xstring = "signmeshckuid"; break; }
		default: { break; }
	    }
	    signMeshKUID[xtype] = null;
	    KUID new_signMeshKUID = p.GetNamedTagAsKUID(xstring);
	    if (new_signMeshKUID)
	    {
		signMeshKUID[xtype] = new_signMeshKUID;
		signMesh[xtype] = World.FindAsset(signMeshKUID[xtype]);
		signType[xtype] = signMesh[xtype].GetLocalisedName();
		if (signType[xtype].size() < 1)
		{
		    Interface.Log("! WARNUNG ! " + GetName() + " - Sign " + signMeshKUID[xtype].GetLogString() + " nicht gefunden");
		    signMeshKUID[xtype] = null;
		}
	    }
	    if (signMeshKUID[xtype] == null)
	    {
		signMesh[xtype] = defaultSignMesh;
		signType[xtype] = "default";
	    }
	}

	for (xtype = 1; xtype <= LAMP_MAX; xtype ++)
	{
	    switch (xtype)
	    {
		case TYPE_A: { xstring = "lampmeshakuid"; break; }
		case TYPE_B: { xstring = "lampmeshbkuid"; break; }
		case TYPE_C: { xstring = "lampmeshckuid"; break; }
		default: { break; }
	    }
	    lampMeshKUID[xtype] = null;
	    KUID new_lampMeshKUID = p.GetNamedTagAsKUID(xstring);
	    if (new_lampMeshKUID)
	    {
		lampMeshKUID[xtype] = new_lampMeshKUID;
		lampMesh[xtype] = World.FindAsset(lampMeshKUID[xtype]);
		lampType[xtype] = lampMesh[xtype].GetLocalisedName();
		if (lampType[xtype].size() < 1)
		{
		    Interface.Log("! WARNUNG ! " + GetName() + " - Lamp " + lampMeshKUID[xtype].GetLogString() + " nicht gefunden");
		    lampMeshKUID[xtype] = null;
		}
	    }
	    if (lampMeshKUID[xtype] == null)
	    {
		lampMesh[xtype] = defaultLampMesh;
		lampType[xtype] = "default";
	    }
	}

//Beginn Ergänzung externe Displays (callavsg)	
		m_aExtDisplays = new ExternalDisplay[0];
		int c;
		for(c = 0; p.GetIndexForNamedTag("ExtDisplay[" + c + "]") != -1; c++)
		{
			m_aExtDisplays[c] = new ExternalDisplay();
			m_aExtDisplays[c].SetProperties(p.GetNamedSoup("ExtDisplay[" + c + "]"));
		}
//Ende Ergänzung externe Displays (callavsg)
	    
	for ( i = 0; i < numberOfTracks; i++)
	{
	    Platforms[i].trackStop = p.GetNamedTagAsInt("trackstop_" + (string) i, STOP_CENTER);
	    SetStopMesh(i + 1);
	    n = p.GetNamedTag("trackname_" + (string) i);
	    if ( n == "")
		n = (string) (i + 1);
	    Platforms[i].trackName = n;

	    for ( j = 0; j <= 3; j++)
	    {
		Platforms[i].priorities[j] = p.GetNamedTagAsBool("prdisplay_" + (string) i + "_" + (string) j, j > 1);
	    }
	    for ( j = 0; j < Platforms[i].count; j++)
	    {
		Platforms[i].Attachments[j].displayType = p.GetNamedTagAsBool("displayType_" + (string) i + "_" + (string) j, false);
		Platforms[i].Attachments[j].displayMounting = p.GetNamedTagAsInt("displayMounting_" + (string) i + "_" + (string) j, MOUNT_NONE);
		Platforms[i].Attachments[j].signType = p.GetNamedTagAsBool("signmask_" + (string) i + "_" + (string) j, false);
		Platforms[i].Attachments[j].signMounting = p.GetNamedTagAsInt("signMounting_" + (string) i + "_" + (string) j, MOUNT_NONE);
		Platforms[i].Attachments[j].lampType = p.GetNamedTagAsBool("lampType_" + (string) i + "_" + (string) j, false);
		Platforms[i].Attachments[j].lampMounting = p.GetNamedTagAsInt("lampMounting_" + (string) i + "_" + (string) j, MOUNT_NONE);
	    }
	    SelectDisplays(i + 1);
	    SelectSigns(i + 1);
	    SelectLamps(i + 1);

	}
    }

    //
    // Determines if a string is prefixed with the given prefix string.
    //
    bool HasPrefix(string searchStr, string prefixStr)
    {
	if (searchStr  and  prefixStr)
	    if (searchStr.size() >= prefixStr.size())
		if (prefixStr == searchStr[,prefixStr.size()])
		    return true;
	return false;
    }
  
    public void AppendDependencies(KUIDList io_dependencies)
    {
	int i;
	
	for (i = 1; i <= DISPLAY_MAX; i++)
	{
	    if (displayMeshKUID[i])
		io_dependencies.AddKUID(displayMeshKUID[i]);
	}
	    
	for (i = 1; i <= SIGN_MAX; i++)
	{
	    if (signMeshKUID[i])
		io_dependencies.AddKUID(signMeshKUID[i]);
	}
	
	for (i = 1; i <= LAMP_MAX; i++)
	{
	    if (lampMeshKUID[i])
		io_dependencies.AddKUID(lampMeshKUID[i]);
	}

	inherited(io_dependencies);
    }
  
};
