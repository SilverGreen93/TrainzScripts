//Script pentru Semnalele CFR luminoase & mecanice
//Autor: Mihai Alexandru Vasiliu (c) 2013
//Bazat pe scriptul original de Octavian
//Data: 30-08-2013

include "Signal.gs"
include "Junction.gs"

class SigLib isclass Library
{
};

class JRule
{
	public Junction[] junc=new Junction[0];
	public string[] njunc=new string[0];
	public int[] dir=new int[0];
	public int direction_marker=0;
	public int exit_left=0; //pentru iesirea pe linia din stanga a caii duble
	public int slow=0;
	public Signal nextSignal;
	public string nextSignalName;
	public int nextSignalID;

	public Soup GetProperties(void)
	{
		Soup sig=Constructors.NewSoup();
		sig.SetNamedTag("NextSignalName",nextSignalName);
		sig.SetNamedTag("num.j",junc.size());
		if (junc.size())
		{
			sig.SetNamedTag("DirectionMarker",direction_marker);
			sig.SetNamedTag("ReduceSpeed",slow);
			sig.SetNamedTag("LeftExit",exit_left);
			int i;
			for (i=0; i<junc.size(); i++)
			{
				sig.SetNamedTag("junc."+i,njunc[i]);
				sig.SetNamedTag("dir."+i,dir[i]);
			}
		}
		return sig;
	}

	public void SetProperties(Soup sig)
	{
		nextSignalName=sig.GetNamedTag("NextSignalName");
		int n=sig.GetNamedTagAsInt("num.j",0);
		junc=new Junction[n];
		njunc=new string[n];
		dir=new int[n];
		if (n)
		{
			direction_marker=sig.GetNamedTagAsInt("DirectionMarker",0);
			slow=sig.GetNamedTagAsInt("ReduceSpeed",0);
			exit_left=sig.GetNamedTagAsInt("LeftExit",0);
			int i;
			for (i=0;i<n;i++)
			{
				njunc[i]=sig.GetNamedTag("junc."+i);
				dir[i]=sig.GetNamedTagAsInt("dir."+i,3);
			}
		}
	}

	public void Setup()
	{
		int i;
		for (i=0; i<njunc.size(); i++)
		{
			junc[i]=cast<Junction>Router.GetGameObject(njunc[i]);
		}
	}
};

class Semnal isclass Signal
{
	//Definitiile textelor de afisat
	public define string T_TITLE = "<p><font color=#FFFFFF size=15>Semnal RO CFR</font> <font color=#FFFFFF size=5>ver. 2.02</font></p>";
	public define string T_BGCOLOR = "bgcolor=#B0B0B0";
	public define string T_BGCOLOR2 = "bgcolor=#D0B040";
	public define string T_SELECT_DIR = "Indicatorul de directie";
	public define string T_SELECT_NAME = "Numele afisat al Semnalului";
	public define string T_SELECT_RESTRICT = "Semnalul indica restrictia";
	public define string T_SELECT_INSTRUCT = "Tip semnalizare";
	public define string T_VITRED = "Restrictia de Viteza";
	public define string T_NONE = "<i>Alege</i>";
	public define string T_DEL = "<font color=#FF0000>Sterge</font>";
	public define string T_RULES_NONE = "Directii Nedefinite";
	public define string T_RULES_ADD = "Adauga Configuratie";
	public define string T_JUNCTION = "Lista de Macaze";
	public define string T_JUNCTION_LEFT = "Stanga";
	public define string T_JUNCTION_FORWARD = "Mijloc";
	public define string T_JUNCTION_RIGHT = "Dreapta";
	public define string T_JUNCTION_ADD = "Adauga Macaz";
	public define string T_IESIRE_ST = "Iesire pe linia din stanga a caii duble ";
	public define string T_XXX = "Semnal scos din uz  ";	
		
	public string[] T_INSTRUCTIA;
	public string[] T_DIRECTIA;
	public string[] T_RESTRICTIA;
		
	//Definitiile becurilor (efectelor din config)
	public define string B_ROSU = "0";
	public define string B_GALBEN = "1";
	public define string B_VERDE = "2";
	public define string B_GAL_JOS = "3";
	public define string B_LINIE = "80";
	public define string B_ROSU_AV = "70";
	public define string B_ALBASTRU = "90";
	public define string B_ALB = "91";
	public define string B_CHEMARE = "92";

	//Definitiile aspectelor semnalelor
	public define int S_ROSU = 0;
	public define int S_GALBEN = 1;
	public define int S_VERDE = 2;
	public define int S_GAL_CL = 3;
	public define int S_GAL_DCL = 4;
	public define int S_VER_CL = 6;
	public define int S_GAL_GAL = 7;
	public define int S_VER_GAL = 8;
	public define int S_GAL_GAL_60 = 13;
	public define int S_VER_GAL_60 = 14;
	public define int S_GAL_GAL_90 = 19;
	public define int S_VER_GAL_90 = 20;
	public define int S_ROSU_AV = 70;
	public define int S_ALBASTRU = 90;
	public define int S_ALB = 91;
	public define int S_CHEMARE = 92;
	public define int T_GALBEN = 100;
	public define int T_GALBEN_20 = 101;
	public define int T_GALBEN_30 = 102;
	public define int T_GALBEN_60 = 103;
	public define int T_GALBEN_80 = 104;
	public define int T_GALBEN_90 = 105;
	public define int T_GALBEN_100 = 106;
	public define int T_VER_CL = 107;
	public define int T_VER_CL_20 = 108;
	public define int T_VER_CL_30 = 109;
	public define int T_VER_CL_60 = 110;
	public define int T_VER_CL_80 = 111;
	public define int T_VER_CL_90 = 112;
	public define int T_VER_CL_100 = 113;
	public define int T_VERDE = 114;
	public define int T_VERDE_20 = 115;
	public define int T_VERDE_30 = 116;
	public define int T_VERDE_60 = 117;
	public define int T_VERDE_80 = 118;
	public define int T_VERDE_90 = 119;
	public define int T_VERDE_100 = 120;

	//Definitiile restrictiilor de viteza
	public define int R_VS = 0;
	public define int R_30 = 1;
	public define int R_60 = 2;
	public define int R_90 = 3;
	public define int R_T20 = 4;
	public define int R_T30 = 5;
	public define int R_T60 = 6;
	public define int R_T80 = 7;
	public define int R_T90 = 8;
	public define int R_T100 = 9;
	public define int R_TVS = 10;
	public define int R_MANEVRA = 91;
	public define int R_CHEMARE = 92;

	//Definitiile variabilelor
	public StringTable ST;
	Asset rosu,galben,verde,alb,albastru,albmic,galbenmic,verdemic,verdeclipitor,galbenclipitor,albclipitor,rosuclipitor,alblinie,galbenclipitor2;
	public JRule[] rules=new JRule[0];
	public int this_aspect;
	public int restriction;
	public int direction;
	public int active_shunt=0;	//Pentru manevra
	public int active_fault=0;	//Pentru avarie
	public int active_call=0;	//Pentru chemare
	public int xxx=0; //Pentru semnal scos din uz
	public int next_aspect;
	public int next_restrict;
	public int use_instruction=0;
	public int current_config_index=-1;
	public bool junction_querry_ok;
	int memo_aspect=-5;
	int memo_direction=-5;
	int memo_restrict=-5;
	public int is_dtv, is_tmv, is_mec;
	public Signal nextSignal;
	public string nextSignalName;
	public Signal active_nextSignal;
	public string active_nextSignalName;
	public string thisSignalDisplayName;

	Semnal[] subscribers=new Semnal[0];

	//Functia ce incarca stringurile "constante" definite mai sus
	void IncarcaStringurile()
	{
		T_INSTRUCTIA = new string[5];
		T_DIRECTIA = new string [50];
		T_RESTRICTIA = new string [100];
		
		T_INSTRUCTIA[1] = "DTV Standard CFR";
		T_INSTRUCTIA[2] = "MECANIC Clasic CFR";
		T_INSTRUCTIA[3] = "TMV Standard CFR";
	
		T_DIRECTIA[0] = "Fara indicarea directiei";
		T_DIRECTIA[1] = "Directia: A";
		T_DIRECTIA[2] = "Directia: B";
		T_DIRECTIA[3] = "Directia: C";
		T_DIRECTIA[4] = "Directia: D";
		T_DIRECTIA[5] = "Directia: E";
		T_DIRECTIA[6] = "Directia: F";
		T_DIRECTIA[7] = "Directia: G";
		T_DIRECTIA[8] = "Directia: H";
		T_DIRECTIA[9] = "Directia: I";
		T_DIRECTIA[10] = "Directia: J";
		T_DIRECTIA[11] = "Directia: K";
		T_DIRECTIA[12] = "Directia: L";
		T_DIRECTIA[13] = "Directia: M";
		T_DIRECTIA[14] = "Directia: N";
		T_DIRECTIA[15] = "Directia: O";
		T_DIRECTIA[16] = "Directia: P";
		T_DIRECTIA[17] = "Directia: Q";
		T_DIRECTIA[18] = "Directia: R";
		T_DIRECTIA[19] = "Directia: S";
		T_DIRECTIA[20] = "Directia: T";
		T_DIRECTIA[21] = "Directia: U";
		T_DIRECTIA[22] = "Directia: V";
		T_DIRECTIA[23] = "Directia: W";
		T_DIRECTIA[24] = "Directia: X";
		T_DIRECTIA[25] = "Directia: Y";
		T_DIRECTIA[26] = "Directia: Z";
		T_DIRECTIA[27] = "Lipsa distantei de franare";
		T_DIRECTIA[28] = "Linia: 1";
		T_DIRECTIA[29] = "Linia: 2";
		T_DIRECTIA[30] = "Linia: 3";
		T_DIRECTIA[31] = "Linia: 4";
		T_DIRECTIA[32] = "Linia: 5";
		T_DIRECTIA[33] = "Linia: 6";
		T_DIRECTIA[34] = "Linia: 7";
		T_DIRECTIA[35] = "Linia: 8";
		T_DIRECTIA[36] = "Linia: 9";
		T_DIRECTIA[37] = "Linia: 10";
		T_DIRECTIA[38] = "Linia: 11";
		T_DIRECTIA[39] = "Linia: 12";
		T_DIRECTIA[40] = "Linia: 13";
		T_DIRECTIA[41] = "Linia: 14";
		
		T_RESTRICTIA[0] = "Viteza Stabilita";
		T_RESTRICTIA[1] = "Viteza Redusa: 30km/h";
		T_RESTRICTIA[2] = "Viteza Redusa: 60km/h";
		T_RESTRICTIA[3] = "Viteza Redusa: 90km/h";
		T_RESTRICTIA[4] = "Viteza Redusa: 20km/h";
		T_RESTRICTIA[5] = "Viteza Redusa: 30km/h";
		T_RESTRICTIA[6] = "Viteza Redusa: 60km/h";
		T_RESTRICTIA[7] = "Viteza Redusa: 80km/h";
		T_RESTRICTIA[8] = "Viteza Redusa: 90km/h";
		T_RESTRICTIA[9] = "Viteza Redusa: 100km/h";
		T_RESTRICTIA[10] = "Viteza Stabilita";
		T_RESTRICTIA[90] = "Manevra Interzisa";
		T_RESTRICTIA[91] = "Manevra: 20km/h";
		T_RESTRICTIA[92] = "Chemare: 20km/h";
	}
	
	//Functia ce returneaza distanta pana la semnalul urmator
	int DistantaSemnal(void)
	{
		GSTrackSearch GSTS=BeginTrackSearch(true);
		MapObject mo=GSTS.SearchNext();
		int dist=0;
		while(mo)
		{
			if ( (mo.isclass(Semnal)) and (GSTS.GetFacingRelativeToSearchDirection()) )
			{
				dist = GSTS.GetDistance();
				break;
			}
			if (GSTS.GetDistance() > 3000)	//Nu cauta semnale mai departe de 3km
			{
				break;
			}
			mo=GSTS.SearchNext();
		} 
		return dist;
	}
 
	//Functia ce returneaza distanta pana la macazul urmator
	int DistantaMacaz(void)
	{
		GSTrackSearch GSTS=BeginTrackSearch(true);
		MapObject mo=GSTS.SearchNext();
		int dist=0;
		while(mo)
		{
			if (cast<Junction>mo)
			{
				dist = GSTS.GetDistance();
				break;
			}
			if (GSTS.GetDistance() > 1000) //Nu cauta macazuri mai departe de 1km
			{
				break;
			}
			mo=GSTS.SearchNext();
		} 
		return dist;
	}
 
	//Functia ce notifica semnalele despre schimbarea aspectului curent
	void NotifySubscribers(void)
	{
		int i;
		for(i=0;i<subscribers.size();i++)
		{
			PostMessage(subscribers[i],"SchimbareAspect",this_aspect,0);
		}
	}

	//Functia ce gaseste regula curenta in functie de orientarea macazelor
	void FindRuleIndex(Junction querry)
	{
		int c;
		int l;
		bool hit=false;
		l=-1;
		junction_querry_ok=false;
		if (rules.size()>0)
		{
			for (c=0; c<rules.size(); c++)
			{
				hit=(rules[c].junc.size()>0);
				int j;
				for (j=0; j<rules[c].junc.size(); j++)
				{
					if (rules[c].junc[j])
					{
						hit=hit and (rules[c].junc[j].GetDirection()==rules[c].dir[j]);
						if (rules[c].junc[j]==querry)
							junction_querry_ok=true;
					}
					else
					{
						hit=false;
					}
				}
				if (hit)
					l=c;
			}
		}
		current_config_index=l;
	}

	//Functia ce returneaza valoarea pentru indicatorul de directie din reguli
	int FindDirection(void)
	{
		if (current_config_index==-1)
			return 0;
		return rules[current_config_index].direction_marker;
	}

	//Functia ce returneaza valoarea restrictiei de viteza din reguli
	int FindLimit(void)
	{
		int k;
		
		if (is_dtv or is_mec)
			k=0;
		else if (is_tmv)
			k=10;
			
		if (current_config_index==-1)
			return k;
			
		return rules[current_config_index].slow;
	}

	Signal FindSignal(void)
	{
		if (current_config_index==-1)
			return nextSignal;
		return rules[current_config_index].nextSignal;
	}

	void Lookup_NextSignal(int direction_index)
	{
		MapObject nextObject;
		Semnal Skip_test;
		Asset Next_asset;
		StringTable Next_settings;
		GSTrackSearch Create_Automatic_Link;
		int i;

		if (direction_index==-1)
		{

			Create_Automatic_Link=me.BeginTrackSearch(true);
			if (Create_Automatic_Link)
			{
		A:
				nextObject=Create_Automatic_Link.SearchNext();

				if (nextObject!=null and (!cast<Signal>nextObject or !Create_Automatic_Link.GetFacingRelativeToSearchDirection()))
					goto A;
					
				Skip_test=cast<Semnal>nextObject;
				
				if (Skip_test)
				{
					Next_asset=Skip_test.GetAsset();
					Next_settings=Next_asset.GetStringTable();
					
					//Nu pune la socoteala MANEVRA, AVARIA, REPETITOR
					if (Str.ToInt(Next_settings.GetString("SIGNAL_DTV_SHUNT")) and !Str.ToInt(Next_settings.GetString("SIGNAL_DTV_EXITENTRY")))
						goto A;
					else if (Str.ToInt(Next_settings.GetString("SIGNAL_TMV_SHUNT")) and !Str.ToInt(Next_settings.GetString("SIGNAL_TMV_EXITENTRY")))
						goto A;
					else if (Str.ToInt(Next_settings.GetString("SIGNAL_DTV_REPEATER")) or Str.ToInt(Next_settings.GetString("SIGNAL_TMV_REPEATER")) or Str.ToInt(Next_settings.GetString("SIGNAL_MEC_REPEATER")))
						goto A;
					else if (Str.ToInt(Next_settings.GetString("SIGNAL_DTV_FAULT")) and !Str.ToInt(Next_settings.GetString("SIGNAL_DTV_LINE_BLOCK")))
						goto A;
					else if (Str.ToInt(Next_settings.GetString("SIGNAL_TMV_FAULT")) and !Str.ToInt(Next_settings.GetString("SIGNAL_TMV_LINE_BLOCK")))
						goto A;
					else if (Str.ToInt(Next_settings.GetString("SIGNAL_MEC_SHUNT")))
						goto A;
				}
				
				nextSignal=cast<Signal>nextObject;
				
				if (nextSignal)
					nextSignalName=nextSignal.GetName();
				else
					nextSignalName="ATENTIE:NU EXISTA!";
					
				if (nextSignalName=="")
					nextSignalName="ATENTIE:Fara Nume!";
			}

		}
		else
		{
			if (rules[direction_index].dir.size()) 
			{
				for(i=0;i<rules[direction_index].junc.size();i++)
				{
					if (rules[direction_index].junc[i]!=null)
						rules[direction_index].junc[i].SetDirection(rules[direction_index].dir[i]);
				}
				Create_Automatic_Link=me.BeginTrackSearch(true);
				if (Create_Automatic_Link)
				{
		B:
					nextObject=Create_Automatic_Link.SearchNext();

					if (nextObject!=null and (!cast<Signal>nextObject or !Create_Automatic_Link.GetFacingRelativeToSearchDirection()))
						goto B;
						
					Skip_test=cast<Semnal>nextObject;
					
					if (Skip_test)
					{
						Next_asset=Skip_test.GetAsset();
						Next_settings=Next_asset.GetStringTable();
						
						//Nu pune la socoteala MANEVRA, AVARIA, REPETITOR
						if (Str.ToInt(Next_settings.GetString("SIGNAL_DTV_SHUNT")) and !Str.ToInt(Next_settings.GetString("SIGNAL_DTV_EXITENTRY")))
							goto B;
						else if (Str.ToInt(Next_settings.GetString("SIGNAL_TMV_SHUNT")) and !Str.ToInt(Next_settings.GetString("SIGNAL_TMV_EXITENTRY")))
							goto B;
						else if (Str.ToInt(Next_settings.GetString("SIGNAL_DTV_REPEATER")) or Str.ToInt(Next_settings.GetString("SIGNAL_TMV_REPEATER")) or Str.ToInt(Next_settings.GetString("SIGNAL_MEC_REPEATER")))
							goto B;
						else if (Str.ToInt(Next_settings.GetString("SIGNAL_DTV_FAULT")) and !Str.ToInt(Next_settings.GetString("SIGNAL_DTV_LINE_BLOCK")))
							goto B;
						else if (Str.ToInt(Next_settings.GetString("SIGNAL_TMV_FAULT")) and !Str.ToInt(Next_settings.GetString("SIGNAL_TMV_LINE_BLOCK")))
							goto B;
						else if (Str.ToInt(Next_settings.GetString("SIGNAL_MEC_SHUNT")))
							goto B;
					}
					
					rules[direction_index].nextSignal=cast<Signal>nextObject;
					
					if (rules[direction_index].nextSignal)
						rules[direction_index].nextSignalName=rules[direction_index].nextSignal.GetName(); 
					else
						rules[direction_index].nextSignalName="ATENTIE:NU EXISTA!";
						
					if (rules[direction_index].nextSignalName=="")
						rules[direction_index].nextSignalName="ATENTIE:Fara Nume!";
				}
			}
		}
	}
	
	//Functia de aprindere a indicatorului luminos de directie
	void Lightup_Direction_Marker(void)
	{
		int k;
		
		if (direction!=memo_direction)
		{
			memo_direction=direction;
			
			//Stinge toate becurile
			for(k=100;k<=134;k++)
				SetFXAttachment(""+k,null);
				
			//Aprinde becurile in forma corespunzatoare literei
			switch (direction)
			{
			//Litere
			case 1: //A
				for(k=130;k>=110;k=k-5) SetFXAttachment(""+k,albmic);
				for(k=106;k>=102;k=k-4) SetFXAttachment(""+k,albmic);
				for(k=108;k<=114;k=k+6) SetFXAttachment(""+k,albmic);
				for(k=119;k<=134;k=k+5) SetFXAttachment(""+k,albmic);
				for(k=121;k<=123;k=k+1) SetFXAttachment(""+k,albmic);
				break;
			case 2: //B
				for(k=130;k>=100;k=k-5) SetFXAttachment(""+k,albmic);
				for(k=101;k<=103;k=k+1) SetFXAttachment(""+k,albmic);
				for(k=109;k<=109;k=k+6) SetFXAttachment(""+k,albmic);
				for(k=114;k<=118;k=k+4) SetFXAttachment(""+k,albmic);
				for(k=124;k<=124;k=k+6) SetFXAttachment(""+k,albmic);
				for(k=129;k<=133;k=k+4) SetFXAttachment(""+k,albmic);
				for(k=132;k>=131;k=k-1) SetFXAttachment(""+k,albmic);
				for(k=117;k>=116;k=k-1) SetFXAttachment(""+k,albmic);
				break;
			case 3:
				for(k=125;k>=105;k=k-5) SetFXAttachment(""+k,albmic);
				for(k=101;k<=103;k=k+1) SetFXAttachment(""+k,albmic);
				for(k=109;k<=109;k=k+6) SetFXAttachment(""+k,albmic);
				for(k=129;k<=133;k=k+4) SetFXAttachment(""+k,albmic);
				for(k=132;k>=131;k=k-1) SetFXAttachment(""+k,albmic);
				break;
			case 4: 
				for(k=130;k>=100;k=k-5) SetFXAttachment(""+k,albmic);
				for(k=101;k<=103;k=k+1) SetFXAttachment(""+k,albmic);
				for(k=109;k<=109;k=k+6) SetFXAttachment(""+k,albmic);
				for(k=114;k<=129;k=k+5) SetFXAttachment(""+k,albmic);
				for(k=133;k<=133;k=k+4) SetFXAttachment(""+k,albmic);
				for(k=132;k>=131;k=k-1) SetFXAttachment(""+k,albmic);
				break;
			case 5:
				for(k=130;k>=100;k=k-5) SetFXAttachment(""+k,albmic);
				for(k=101;k<=104;k=k+1) SetFXAttachment(""+k,albmic);
				for(k=118;k>=116;k=k-1) SetFXAttachment(""+k,albmic);
				for(k=134;k>=131;k=k-1) SetFXAttachment(""+k,albmic);
				break;
			case 6: 
				for(k=130;k>=100;k=k-5) SetFXAttachment(""+k,albmic);
				for(k=101;k<=104;k=k+1) SetFXAttachment(""+k,albmic);
				for(k=118;k>=116;k=k-1) SetFXAttachment(""+k,albmic);
				break;
			case 7:
				for(k=125;k>=105;k=k-5) SetFXAttachment(""+k,albmic);
				for(k=101;k<=103;k=k+1) SetFXAttachment(""+k,albmic);
				for(k=109;k<=109;k=k+6) SetFXAttachment(""+k,albmic);
				for(k=129;k<=133;k=k+4) SetFXAttachment(""+k,albmic);
				for(k=132;k>=131;k=k-1) SetFXAttachment(""+k,albmic);
				for(k=124;k>=118;k=k-6) SetFXAttachment(""+k,albmic);
				for(k=117;k>=117;k=k-1) SetFXAttachment(""+k,albmic);
				break;
			case 8:
				for(k=130;k>=100;k=k-5) SetFXAttachment(""+k,albmic);
				for(k=134;k>=104;k=k-5) SetFXAttachment(""+k,albmic);
				for(k=118;k>=116;k=k-1) SetFXAttachment(""+k,albmic);
				break;
			case 9:
				for(k=101;k<=103;k=k+1) SetFXAttachment(""+k,albmic);
				for(k=131;k<=133;k=k+1) SetFXAttachment(""+k,albmic);
				for(k=107;k<=127;k=k+5) SetFXAttachment(""+k,albmic);
				break;
			case 10:
				for(k=100;k<=103;k=k+1) SetFXAttachment(""+k,albmic);
				for(k=104;k<=129;k=k+5) SetFXAttachment(""+k,albmic);
				for(k=133;k>=131;k=k-1) SetFXAttachment(""+k,albmic);
				for(k=125;k>=120;k=k-5) SetFXAttachment(""+k,albmic);
				break;
			case 11:
				for(k=130;k>=100;k=k-5) SetFXAttachment(""+k,albmic);
				for(k=116;k>=104;k=k-4) SetFXAttachment(""+k,albmic);
				for(k=122;k<=134;k=k+6) SetFXAttachment(""+k,albmic);
				break;
			case 12:
				for(k=130;k>=100;k=k-5) SetFXAttachment(""+k,albmic);
				for(k=131;k<=134;k=k+1) SetFXAttachment(""+k,albmic);
				break;
			case 13:
				for(k=130;k>=100;k=k-5) SetFXAttachment(""+k,albmic);
				for(k=134;k>=104;k=k-5) SetFXAttachment(""+k,albmic);
				for(k=106;k<=112;k=k+6) SetFXAttachment(""+k,albmic);
				for(k=108;k>=108;k=k-4) SetFXAttachment(""+k,albmic);
				break;
			case 14:
				for(k=130;k>=100;k=k-5) SetFXAttachment(""+k,albmic);
				for(k=134;k>=104;k=k-5) SetFXAttachment(""+k,albmic);
				for(k=111;k<=123;k=k+6) SetFXAttachment(""+k,albmic);
				break;
			case 15:
				for(k=125;k>=105;k=k-5) SetFXAttachment(""+k,albmic);
				for(k=129;k>=109;k=k-5) SetFXAttachment(""+k,albmic);
				for(k=101;k<=103;k=k+1) SetFXAttachment(""+k,albmic);
				for(k=131;k<=133;k=k+1) SetFXAttachment(""+k,albmic);
				break;
			case 16:
				for(k=130;k>=100;k=k-5) SetFXAttachment(""+k,albmic);
				for(k=101;k<=103;k=k+1) SetFXAttachment(""+k,albmic);
				for(k=109;k<=114;k=k+5) SetFXAttachment(""+k,albmic);
				for(k=118;k>=116;k=k-1) SetFXAttachment(""+k,albmic);
				break;
			case 17:
				for(k=125;k>=105;k=k-5) SetFXAttachment(""+k,albmic);
				for(k=129;k>=109;k=k-5) SetFXAttachment(""+k,albmic);
				for(k=101;k<=103;k=k+1) SetFXAttachment(""+k,albmic);
				for(k=131;k<=133;k=k+1) SetFXAttachment(""+k,albmic);
				for(k=134;k>=122;k=k-6) SetFXAttachment(""+k,albmic);
				break;
			case 18:
				for(k=130;k>=100;k=k-5) SetFXAttachment(""+k,albmic);
				for(k=101;k<=103;k=k+1) SetFXAttachment(""+k,albmic);
				for(k=109;k<=114;k=k+5) SetFXAttachment(""+k,albmic);
				for(k=118;k>=116;k=k-1) SetFXAttachment(""+k,albmic);
				for(k=134;k>=122;k=k-6) SetFXAttachment(""+k,albmic);
				break;
			case 19:
				for(k=104;k>=101;k=k-1) SetFXAttachment(""+k,albmic);
				for(k=105;k<=110;k=k+5) SetFXAttachment(""+k,albmic);
				for(k=116;k<=118;k=k+1) SetFXAttachment(""+k,albmic);
				for(k=124;k<=129;k=k+5) SetFXAttachment(""+k,albmic);
				for(k=133;k>=130;k=k-1) SetFXAttachment(""+k,albmic);
				break;
			case 20:
				for(k=100;k<=104;k=k+1) SetFXAttachment(""+k,albmic);
				for(k=107;k<=132;k=k+5) SetFXAttachment(""+k,albmic);
				break;
			case 21:
				for(k=125;k>=100;k=k-5) SetFXAttachment(""+k,albmic);
				for(k=129;k>=104;k=k-5) SetFXAttachment(""+k,albmic);
				for(k=131;k<=133;k=k+1) SetFXAttachment(""+k,albmic);
				break;
			case 22:
				for(k=100;k<=120;k=k+5) SetFXAttachment(""+k,albmic);
				for(k=126;k<=132;k=k+6) SetFXAttachment(""+k,albmic);
				for(k=128;k>=124;k=k-4) SetFXAttachment(""+k,albmic);
				for(k=119;k>=104;k=k-5) SetFXAttachment(""+k,albmic);
				break;
			case 23:
				for(k=100;k<=125;k=k+5) SetFXAttachment(""+k,albmic);
				for(k=131;k>=127;k=k-4) SetFXAttachment(""+k,albmic);
				for(k=122;k>=117;k=k-5) SetFXAttachment(""+k,albmic);
				for(k=133;k>=129;k=k-4) SetFXAttachment(""+k,albmic);
				for(k=124;k>=104;k=k-5) SetFXAttachment(""+k,albmic);
				break;
			case 24:
				for(k=100;k<=105;k=k+5) SetFXAttachment(""+k,albmic);
				for(k=125;k<=130;k=k+5) SetFXAttachment(""+k,albmic);
				for(k=104;k<=109;k=k+5) SetFXAttachment(""+k,albmic);
				for(k=129;k<=134;k=k+5) SetFXAttachment(""+k,albmic);
				for(k=111;k<=123;k=k+6) SetFXAttachment(""+k,albmic);
				for(k=121;k>=113;k=k-4) SetFXAttachment(""+k,albmic);
				break;
			case 25: //Y
				for(k=105;k<=117;k=k+6) SetFXAttachment(""+k,albmic);
				for(k=113;k>=109;k=k-4) SetFXAttachment(""+k,albmic);
				for(k=122;k<=132;k=k+5) SetFXAttachment(""+k,albmic);
				for(k=100;k<=100;k=k+5) SetFXAttachment(""+k,albmic);
				for(k=104;k<=104;k=k+5) SetFXAttachment(""+k,albmic);
				break;
			case 26: //Z
				for(k=100;k<=104;k=k+1) SetFXAttachment(""+k,albmic);
				for(k=108;k<=120;k=k+4) SetFXAttachment(""+k,albmic);
				for(k=125;k<=130;k=k+5) SetFXAttachment(""+k,albmic);
				for(k=131;k<=134;k=k+1) SetFXAttachment(""+k,albmic);
				for(k=109;k<=109;k=k+5) SetFXAttachment(""+k,albmic);
				break;
			case 27: //Sageata in jos
				for(k=102;k<=127;k=k+5) SetFXAttachment(""+k,albmic);
				for(k=132;k>=120;k=k-6) SetFXAttachment(""+k,albmic);
				for(k=128;k>=124;k=k-4) SetFXAttachment(""+k,albmic);
				break;
			//Cifre
			case 28: //1
				for(k=102;k<=106;k=k+4) SetFXAttachment(""+k,verdemic);
				for(k=107;k<=127;k=k+5) SetFXAttachment(""+k,verdemic);
				for(k=131;k<=133;k=k+1) SetFXAttachment(""+k,verdemic);
				break;
			case 29: //2
				for(k=102;k<=106;k=k+4) SetFXAttachment(""+k,verdemic);
				for(k=108;k<=113;k=k+5) SetFXAttachment(""+k,verdemic);
				for(k=117;k<=121;k=k+4) SetFXAttachment(""+k,verdemic);
				for(k=126;k<=131;k=k+5) SetFXAttachment(""+k,verdemic);
				for(k=132;k<=133;k=k+1) SetFXAttachment(""+k,verdemic);
				break;	
			case 30: //3
				for(k=102;k<=106;k=k+4) SetFXAttachment(""+k,verdemic);
				for(k=108;k<=113;k=k+5) SetFXAttachment(""+k,verdemic);
				for(k=117;k<=123;k=k+6) SetFXAttachment(""+k,verdemic);
				for(k=123;k<=128;k=k+5) SetFXAttachment(""+k,verdemic);
				for(k=126;k<=132;k=k+6) SetFXAttachment(""+k,verdemic);
				break;
			case 31: //4
				for(k=103;k<=111;k=k+4) SetFXAttachment(""+k,verdemic);
				for(k=116;k<=117;k=k+1) SetFXAttachment(""+k,verdemic);
				for(k=108;k<=133;k=k+5) SetFXAttachment(""+k,verdemic);
				break;
			case 32: //5
				for(k=101;k<=103;k=k+1) SetFXAttachment(""+k,verdemic);
				for(k=106;k<=111;k=k+5) SetFXAttachment(""+k,verdemic);
				for(k=117;k<=123;k=k+6) SetFXAttachment(""+k,verdemic);
				for(k=128;k<=132;k=k+4) SetFXAttachment(""+k,verdemic);
				for(k=126;k<=132;k=k+6) SetFXAttachment(""+k,verdemic);
				break;
			case 33: //6
				for(k=102;k<=108;k=k+6) SetFXAttachment(""+k,verdemic);
				for(k=106;k<=126;k=k+5) SetFXAttachment(""+k,verdemic);
				for(k=117;k<=132;k=k+15) SetFXAttachment(""+k,verdemic);
				for(k=123;k<=128;k=k+5) SetFXAttachment(""+k,verdemic);
				break;
			case 34: //7
				for(k=101;k<=106;k=k+5) SetFXAttachment(""+k,verdemic);
				for(k=102;k<=103;k=k+1) SetFXAttachment(""+k,verdemic);
				for(k=108;k<=113;k=k+5) SetFXAttachment(""+k,verdemic);
				for(k=117;k<=132;k=k+5) SetFXAttachment(""+k,verdemic);
				break;
			case 35: //8
				for(k=102;k<=132;k=k+15) SetFXAttachment(""+k,verdemic);
				for(k=106;k<=111;k=k+5) SetFXAttachment(""+k,verdemic);
				for(k=121;k<=126;k=k+5) SetFXAttachment(""+k,verdemic);
				for(k=123;k<=128;k=k+5) SetFXAttachment(""+k,verdemic);
				for(k=108;k<=113;k=k+5) SetFXAttachment(""+k,verdemic);
				break;
			case 36: //9
				for(k=102;k<=132;k=k+15) SetFXAttachment(""+k,verdemic);
				for(k=126;k<=132;k=k+6) SetFXAttachment(""+k,verdemic);
				for(k=108;k<=128;k=k+5) SetFXAttachment(""+k,verdemic);
				for(k=106;k<=111;k=k+5) SetFXAttachment(""+k,verdemic);
				break;
			case 37: //10
				for(k=100;k<=130;k=k+5) SetFXAttachment(""+k,verdemic);
				for(k=107;k<=127;k=k+5) SetFXAttachment(""+k,verdemic);
				for(k=109;k<=129;k=k+5) SetFXAttachment(""+k,verdemic);
				for(k=103;k<=133;k=k+30) SetFXAttachment(""+k,verdemic);
				break;
			case 38: //11
				for(k=101;k<=131;k=k+5) SetFXAttachment(""+k,verdemic);
				for(k=104;k<=134;k=k+5) SetFXAttachment(""+k,verdemic);
				for(k=105;k<=108;k=k+3) SetFXAttachment(""+k,verdemic);
				break;
			case 39: //12
				for(k=100;k<=130;k=k+5) SetFXAttachment(""+k,verdemic);
				for(k=103;k<=107;k=k+4) SetFXAttachment(""+k,verdemic);
				for(k=109;k<=114;k=k+5) SetFXAttachment(""+k,verdemic);
				for(k=118;k<=122;k=k+4) SetFXAttachment(""+k,verdemic);
				for(k=127;k<=132;k=k+5) SetFXAttachment(""+k,verdemic);
				for(k=133;k<=134;k=k+1) SetFXAttachment(""+k,verdemic);
				break;
			case 40: //13
				for(k=100;k<=130;k=k+5) SetFXAttachment(""+k,verdemic);
				for(k=103;k<=107;k=k+4) SetFXAttachment(""+k,verdemic);
				for(k=109;k<=114;k=k+5) SetFXAttachment(""+k,verdemic);
				for(k=118;k<=124;k=k+6) SetFXAttachment(""+k,verdemic);
				for(k=124;k<=129;k=k+5) SetFXAttachment(""+k,verdemic);
				for(k=127;k<=133;k=k+6) SetFXAttachment(""+k,verdemic);
				break;
			case 41: //14
				for(k=100;k<=130;k=k+5) SetFXAttachment(""+k,verdemic);
				for(k=104;k<=112;k=k+4) SetFXAttachment(""+k,verdemic);
				for(k=117;k<=118;k=k+1) SetFXAttachment(""+k,verdemic);
				for(k=109;k<=134;k=k+5) SetFXAttachment(""+k,verdemic);
				break;
			default:;
			}
		}
	}

	//Functia de aprindere a indicatorului TMV luminos de limita viteza curenta
	void TMV_this_limit(int k)
	{
		int l;

		switch (k)
		{
		case 0:	//stinge tot
			for(l=200;l<=234;l++) SetFXAttachment(""+l,null);
			break;
		case 4: //20km/h
			for(l=201;l<=204;l=l+1) SetFXAttachment(""+l,albmic);
			for(l=209;l<=219;l=l+5) SetFXAttachment(""+l,albmic);
			for(l=218;l>=216;l=l-1) SetFXAttachment(""+l,albmic);
			for(l=221;l<=231;l=l+5) SetFXAttachment(""+l,albmic);
			for(l=232;l<=234;l=l+1) SetFXAttachment(""+l,albmic);
			SetSpeedLimit(20/3.6);
			break;
		case 5: //30km/h
			for(l=201;l<=204;l=l+1) SetFXAttachment(""+l,albmic);
			for(l=209;l<=234;l=l+5) SetFXAttachment(""+l,albmic);
			for(l=233;l>=231;l=l-1) SetFXAttachment(""+l,albmic);
			for(l=218;l>=216;l=l-1) SetFXAttachment(""+l,albmic);
			SetSpeedLimit(30/3.6);
			break;
		case 6: //60km/h
			for(l=204;l>=201;l=l-1) SetFXAttachment(""+l,albmic);
			for(l=206;l<=231;l=l+5) SetFXAttachment(""+l,albmic);
			for(l=232;l<=234;l=l+1) SetFXAttachment(""+l,albmic);
			for(l=229;l>=219;l=l-5) SetFXAttachment(""+l,albmic);
			for(l=218;l>=217;l=l-1) SetFXAttachment(""+l,albmic);
			SetSpeedLimit(60/3.6);
			break;
		case 7: //80km/h
			for(l=204;l>=201;l=l-1) SetFXAttachment(""+l,albmic);
			for(l=206;l<=231;l=l+5) SetFXAttachment(""+l,albmic);
			for(l=232;l<=234;l=l+1) SetFXAttachment(""+l,albmic);
			for(l=229;l>=204;l=l-5) SetFXAttachment(""+l,albmic);
			for(l=218;l>=217;l=l-1) SetFXAttachment(""+l,albmic);
			for(l=203;l>=202;l=l-1) SetFXAttachment(""+l,albmic);
			SetSpeedLimit(80/3.6);
			break;
		case 8: //90km/h
			for(l=204;l>=201;l=l-1) SetFXAttachment(""+l,albmic);
			for(l=206;l<=216;l=l+5) SetFXAttachment(""+l,albmic);
			for(l=231;l<=234;l=l+1) SetFXAttachment(""+l,albmic);
			for(l=229;l>=204;l=l-5) SetFXAttachment(""+l,albmic);
			for(l=218;l>=217;l=l-1) SetFXAttachment(""+l,albmic);
			for(l=203;l>=202;l=l-1) SetFXAttachment(""+l,albmic);
			SetSpeedLimit(90/3.6);
			break;
		case 9: //100km/h
			for(l=204;l>=202;l=l-1) SetFXAttachment(""+l,albmic);
			for(l=207;l<=232;l=l+5) SetFXAttachment(""+l,albmic);
			for(l=233;l<=234;l=l+1) SetFXAttachment(""+l,albmic);
			for(l=229;l>=204;l=l-5) SetFXAttachment(""+l,albmic);
			for(l=203;l>=203;l=l-1) SetFXAttachment(""+l,albmic);
			for(l=200;l<=230;l=l+5) SetFXAttachment(""+l,albmic);
			SetSpeedLimit(100/3.6);
			break;
		case 10: //stinge tot
			for(l=200;l<=234;l++) SetFXAttachment(""+l,null);
			break;
		default:;
		}
	}

	//Functia de aprindere a indicatorului TMV luminos de limita viteza prevestita
	void TMV_next_limit(int k)
	{
		int l;

		switch (k)
		{
		case 0: //stinge tot
			for(l=300;l<=334;l++) SetFXAttachment(""+l,null);
			break;
		case 4: //20km/h
			for(l=301;l<=304;l=l+1) SetFXAttachment(""+l,galbenmic);
			for(l=309;l<=319;l=l+5) SetFXAttachment(""+l,galbenmic);
			for(l=318;l>=316;l=l-1) SetFXAttachment(""+l,galbenmic);
			for(l=321;l<=331;l=l+5) SetFXAttachment(""+l,galbenmic);
			for(l=332;l<=334;l=l+1) SetFXAttachment(""+l,galbenmic);
			break;
		case 5: //30km/h
			for(l=301;l<=304;l=l+1) SetFXAttachment(""+l,galbenmic);
			for(l=309;l<=334;l=l+5) SetFXAttachment(""+l,galbenmic);
			for(l=333;l>=331;l=l-1) SetFXAttachment(""+l,galbenmic);
			for(l=318;l>=316;l=l-1) SetFXAttachment(""+l,galbenmic);
			break;
		case 6: //60km/h
			for(l=304;l>=301;l=l-1) SetFXAttachment(""+l,galbenmic);
			for(l=306;l<=331;l=l+5) SetFXAttachment(""+l,galbenmic);
			for(l=332;l<=334;l=l+1) SetFXAttachment(""+l,galbenmic);
			for(l=329;l>=319;l=l-5) SetFXAttachment(""+l,galbenmic);
			for(l=318;l>=317;l=l-1) SetFXAttachment(""+l,galbenmic);
			break;
		case 7: //80km/h
			for(l=304;l>=301;l=l-1) SetFXAttachment(""+l,galbenmic);
			for(l=306;l<=331;l=l+5) SetFXAttachment(""+l,galbenmic);
			for(l=332;l<=334;l=l+1) SetFXAttachment(""+l,galbenmic);
			for(l=329;l>=304;l=l-5) SetFXAttachment(""+l,galbenmic);
			for(l=318;l>=317;l=l-1) SetFXAttachment(""+l,galbenmic);
			for(l=303;l>=302;l=l-1) SetFXAttachment(""+l,galbenmic);
			break;
		case 8: //90km/h
			for(l=304;l>=301;l=l-1) SetFXAttachment(""+l,galbenmic);
			for(l=306;l<=316;l=l+5) SetFXAttachment(""+l,galbenmic);
			for(l=331;l<=334;l=l+1) SetFXAttachment(""+l,galbenmic);
			for(l=329;l>=304;l=l-5) SetFXAttachment(""+l,galbenmic);
			for(l=318;l>=317;l=l-1) SetFXAttachment(""+l,galbenmic);
			for(l=303;l>=302;l=l-1) SetFXAttachment(""+l,galbenmic);
			break;
		case 9: //100km/h
			for(l=304;l>=302;l=l-1) SetFXAttachment(""+l,galbenmic);
			for(l=307;l<=332;l=l+5) SetFXAttachment(""+l,galbenmic);
			for(l=333;l<=334;l=l+1) SetFXAttachment(""+l,galbenmic);
			for(l=329;l>=304;l=l-5) SetFXAttachment(""+l,galbenmic);
			for(l=303;l>=303;l=l-1) SetFXAttachment(""+l,galbenmic);
			for(l=300;l<=330;l=l+5) SetFXAttachment(""+l,galbenmic);
			break;
		case 10: //stinge tot
			for(l=300;l<=334;l++) SetFXAttachment(""+l,null);
			break;
		default:;
		}
	}

	//Functia de stingere a tuturor becurilor semnalelor
	void Lights_Off(void)
	{
		switch (Str.ToInt(ST.GetString("LIGHTS_COUNT")))
		{
		case 1:	
			if (Str.ToInt(ST.GetString("SIGNAL_MEC_REPEATER"))) //MECANIC REPETITOR
			{
				SetFXCoronaTexture(B_GALBEN,null);
				SetMeshAnimationFrame("default",0,1);
			}
			else if (Str.ToInt(ST.GetString("SIGNAL_MEC_EXITENTRY")))
			{ //MECANIC INTRARE sau IESIRE cu 1i
				SetFXCoronaTexture(B_ROSU,null);
				SetMeshAnimationFrame("default",0,1);
			}
			else if (Str.ToInt(ST.GetString("SIGNAL_MEC_SHUNT")))
			{ //MECANIC MANEVRA
				SetFXCoronaTexture(B_ALB,null);
				SetMeshAnimationFrame("default",0,1);
			}
			else if (Str.ToInt(ST.GetString("SIGNAL_MEC_DISTANT")))
			{ //MECANIC PREVESTITOR 2i
				SetFXCoronaTexture(B_GALBEN,null);
				SetMeshAnimationFrame("default",0,1);
			}
			else //AVARIE
				SetFXAttachment(B_ROSU_AV,null);
			break;
		case 2:
			if (Str.ToInt(ST.GetString("SIGNAL_DTV_EXITENTRY")))
			{ //SSSR 2
				SetFXAttachment(B_ROSU,null);
				SetFXAttachment(B_ALB,null);
				SetFXAttachment(B_CHEMARE,null);
			}
			else if (Str.ToInt(ST.GetString("SIGNAL_TMV_EXITENTRY")))
			{ //TMV 2
				SetFXAttachment(B_ROSU,null);
				SetFXAttachment(B_GALBEN,null);
				SetFXAttachment(B_ALB,null);
				SetFXAttachment(B_CHEMARE,null);
				SetFXAttachment(B_LINIE,null);
			}
			else if (Str.ToInt(ST.GetString("SIGNAL_DTV_SHUNT")) or Str.ToInt(ST.GetString("SIGNAL_TMV_SHUNT")))
			{ //MANEVRA
				SetFXAttachment(B_ALBASTRU,null);
				SetFXAttachment(B_ALB,null);
			}
			else if (Str.ToInt(ST.GetString("SIGNAL_DTV_DISTANT")) or Str.ToInt(ST.GetString("SIGNAL_TMV_DISTANT")))
			{ //PREVESTITOR
				SetFXAttachment(B_GALBEN,null);
				SetFXAttachment(B_VERDE,null);
			}
			else if (Str.ToInt(ST.GetString("SIGNAL_MEC_EXITENTRY")))
			{ //MECANIC INTRARE sau IESIRE cu 2i
				SetFXCoronaTexture(B_ROSU,null);
				SetFXCoronaTexture(B_GALBEN,null);
				SetMeshAnimationFrame("default",60,1);
			}
			else if (Str.ToInt(ST.GetString("SIGNAL_MEC_DISTANT")))
			{ //MECANIC PREVESTITOR 3i
				SetFXCoronaTexture(B_GALBEN,null);
				SetFXCoronaTexture(B_GAL_JOS,null);
				SetMeshAnimationFrame("default",0,2);
				SetMeshAnimationFrame("paleta",60,1);
			}
			break;
		case 3:	
			if (Str.ToInt(ST.GetString("SIGNAL_MEC_EXITENTRY")))
			{ //MECANIC INTRARE sau IESIRE cu 3i
				SetFXCoronaTexture(B_ROSU,null);
				SetFXCoronaTexture(B_GALBEN,null);
				SetFXCoronaTexture(B_GAL_JOS,null);
				SetMeshAnimationFrame("default",60,1);
				SetMeshAnimationFrame("paleta",0,2);
			}
			else
			{ //BLA sau SSSR 3 sau TMV 3
				SetFXAttachment(B_ROSU,null);
				SetFXAttachment(B_GALBEN,null);
				SetFXAttachment(B_VERDE,null);
				if (Str.ToInt(ST.GetString("SIGNAL_DTV_FAULT")) or Str.ToInt(ST.GetString("SIGNAL_TMV_FAULT")))
					SetFXAttachment(B_ROSU_AV,null);
				if (Str.ToInt(ST.GetString("SIGNAL_DTV_SHUNT")) or Str.ToInt(ST.GetString("SIGNAL_TMV_SHUNT")))
					SetFXAttachment(B_ALB,null);
				if (Str.ToInt(ST.GetString("SIGNAL_DTV_EXITENTRY")) or Str.ToInt(ST.GetString("SIGNAL_TMV_EXITENTRY")))
					SetFXAttachment(B_LINIE,null);
			}
			break;
		case 4:	//SSSR 4
			SetFXAttachment(B_ROSU,null);
			SetFXAttachment(B_GALBEN,null);
			SetFXAttachment(B_VERDE,null);
			SetFXAttachment(B_GAL_JOS,null);
			if (Str.ToInt(ST.GetString("SIGNAL_DTV_SHUNT")))
				SetFXAttachment(B_ALB,null);
			SetFXAttachment(B_LINIE,null);
			SetFXAttachment(B_CHEMARE,null);
			break;
		case 5: //SSSR 5 sau TMV 5
			SetFXAttachment(B_ROSU,null);
			SetFXAttachment(B_GALBEN,null);
			SetFXAttachment(B_VERDE,null);
			if (Str.ToInt(ST.GetString("SIGNAL_DTV_EXITENTRY")))
				SetFXAttachment(B_GAL_JOS,null);
			SetFXAttachment(B_ALB,null);
			SetFXAttachment(B_LINIE,null);
			SetFXAttachment(B_CHEMARE,null);
			break;
		case 13: //REPETITOR
			SetFXAttachment("50",null);
			SetFXAttachment("51",null);
			SetFXAttachment("52",null);
			SetFXAttachment("53",null);
			SetFXAttachment("54",null);
			SetFXAttachment("55",null);
			SetFXAttachment("56",null);
			SetFXAttachment("57",null);
			SetFXAttachment("58",null);
			SetFXAttachment("59",null);
			SetFXAttachment("60",null);
			SetFXAttachment("61",null);
			SetFXAttachment("62",null);
			break;
		default:;
		}
		if (is_dtv)
		{
			switch (Str.ToInt(ST.GetString("HAS_BAR")))
			{
			case 1: //Bara galbena 60km/h
				SetFXAttachment("45",null);
				SetFXAttachment("46",null);
				SetFXAttachment("47",null);
				SetFXAttachment("48",null);
				break;
			case 2: //Bara verde 90km/h
				SetFXAttachment("40",null);
				SetFXAttachment("41",null);
				SetFXAttachment("42",null);
				SetFXAttachment("43",null);
				break;
			case 3: //Ambele bare 60/90
				SetFXAttachment("40",null);
				SetFXAttachment("41",null);
				SetFXAttachment("42",null);
				SetFXAttachment("43",null);
				SetFXAttachment("45",null);
				SetFXAttachment("46",null);
				SetFXAttachment("47",null);
				SetFXAttachment("48",null);
				break;
			default:;
			}
		}
	}

	//Functia de aprindere a semnalelor TMV
	void SignalControl_TMV(void)
	{
		//INTRARE si IESIRE
		if (Str.ToInt(ST.GetString("SIGNAL_TMV_EXITENTRY")))
		{
			if (GetSignalState()==RED) 
			{
				this_aspect=0;
				if (this_aspect!=memo_aspect)
				{
					NotifySubscribers();
					memo_aspect=0;
					Lights_Off();
					
					if (Str.ToInt(ST.GetString("HAS_BAR"))==1) 
						TMV_this_limit(0);
					if (Str.ToInt(ST.GetString("HAS_BAR"))==2) 
						TMV_next_limit(0);
					if (Str.ToInt(ST.GetString("HAS_BAR"))==3) 
					{
						TMV_this_limit(0);
						TMV_next_limit(0);
					}
					if (Str.ToInt(ST.GetString("HAS_DIRECTION_MARKER")))
					{
						direction=0;
						Lightup_Direction_Marker();
					}
					SetFXAttachment(B_ROSU,rosu);
				}
			}
			else
			{
				if (!active_shunt)
				{
					restriction=FindLimit();
					switch (next_aspect)
					{
					case S_ROSU:
						switch (restriction)
						{
						case R_T20:
							this_aspect=101;
							next_restrict=R_VS;
							break;
						case R_T30:
							this_aspect=102;
							next_restrict=R_VS;
							break;
						case R_T60:
							this_aspect=103;
							next_restrict=R_VS;
							break;
						case R_T80:
							this_aspect=104;
							next_restrict=R_VS;
							break;
						case R_T90:
							this_aspect=105;
							next_restrict=R_VS;
							break;
						case R_T100:
							this_aspect=106;
							next_restrict=R_VS;
							break;
						case R_TVS:
							this_aspect=T_GALBEN;
							next_restrict=R_VS;
							break;
						default:;
						}
						break;
					case 1:
						switch (restriction)
						{
						case 4:
                             this_aspect=115;
                             next_restrict=R_VS;
                             break;
						case 5:
                             this_aspect=116;
                             next_restrict=R_VS;
                             break;
						case 6:
                             this_aspect=117;
                             next_restrict=R_VS;
                             break;
						case 7:
                             this_aspect=118;
                             next_restrict=R_VS;
                             break;
						case 8:
                             this_aspect=119;
                             next_restrict=R_VS;
                             break;
						case 9:
                             this_aspect=120;
                             next_restrict=R_VS;
                             break;
						case 10:
                             this_aspect=T_VER_CL;
                             next_restrict=R_VS;
                             break;
						default:;
						}
						break;
					case 2:
						switch (restriction)
						{
						case 4:
                             this_aspect=115;
                             next_restrict=R_VS;
                             break;
						case 5:
                             this_aspect=116;
                             next_restrict=R_VS;
                             break;
						case 6:
                             this_aspect=117;
                             next_restrict=R_VS;
                             break;
						case 7:
                             this_aspect=118;
                             next_restrict=R_VS;
                             break;
						case 8:
                             this_aspect=119;
                             next_restrict=R_VS;
                             break;
						case 9:
                             this_aspect=120;
                             next_restrict=R_VS;
                             break;
						case 10:
                             this_aspect=T_VERDE;
                             next_restrict=R_VS;
                             break;
						default:;
						}
						break;
					case 3:
						switch (restriction)
						{
						case 4:
                             this_aspect=115;
                             next_restrict=R_VS;
                             break;
						case 5:
                             this_aspect=116;
                             next_restrict=R_VS;
                             break;
						case 6:
                             this_aspect=117;
                             next_restrict=R_VS;
                             break;
						case 7:
                             this_aspect=118;
                             next_restrict=R_VS;
                             break;
						case 8:
                             this_aspect=119;
                             next_restrict=R_VS;
                             break;
						case 9:
                             this_aspect=120;
                             next_restrict=R_VS;
                             break;
						case 10:
                             this_aspect=T_VERDE;
                             next_restrict=R_VS;
                             break;
						default:;
						}
						break;
					case 4:
						switch (restriction)
						{
						case 4:
                             this_aspect=115;
                             next_restrict=R_VS;
                             break;
						case 5:
                             this_aspect=116;
                             next_restrict=R_VS;
                             break;
						case 6:
							 this_aspect=117;
                             next_restrict=R_VS;
                             break;
						case 7:
                             this_aspect=118;
                             next_restrict=R_VS;
                             break;
						case 8:
                             this_aspect=119;
                             next_restrict=R_VS;
                             break;
						case 9:
                             this_aspect=120;
                             next_restrict=R_VS;
                             break;
						case 10:
                             this_aspect=T_VERDE;
                             next_restrict=R_VS;
                             break;
						default:;
						}
						break;
					case 6:
						switch (restriction)
						{
						case 4:
                             this_aspect=115;
                             next_restrict=R_VS;
                             break;
						case 5:
                             this_aspect=116;
                             next_restrict=R_VS;
                             break;
						case 6:
                             this_aspect=117;
                             next_restrict=R_VS;
                             break;
						case 7:
                             this_aspect=118;
                             next_restrict=R_VS;
                             break;
						case 8:
                             this_aspect=119;
                             next_restrict=R_VS;
                             break;
						case 9:
                             this_aspect=120;
                             next_restrict=R_VS;
                             break;
						case 10:
                             this_aspect=T_VERDE;
                             next_restrict=R_VS;
                             break;
						default:;
						}
						break;
					case 7:
						switch (restriction)
						{
						case 4:
                             this_aspect=115;
                             next_restrict=R_VS;
                             break;
						case 5:
                             this_aspect=116;
                             next_restrict=R_VS;
                             break;
						case 6:
                             this_aspect=110;
                             next_restrict=5;
                             break;
						case 7:
                             this_aspect=111;
                             next_restrict=5;
                             break;
						case 8:
                             this_aspect=112;
                             next_restrict=5;
                             break;
						case 9:
                             this_aspect=113;
                             next_restrict=5;
                             break;
						case 10:
                             this_aspect=T_VER_CL;
                             next_restrict=5;
                             break;
						default:;
						}
						break;
					case 8:
						switch (restriction)
						{
						case 4:
                             this_aspect=115;
                             next_restrict=R_VS;
                             break;
						case 5:
                             this_aspect=116;
                             next_restrict=R_VS;
                             break;
						case 6:
                             this_aspect=110;
                             next_restrict=5;
                             break;
						case 7:
                             this_aspect=111;
                             next_restrict=5;
                             break;
						case 8:
                             this_aspect=112;
                             next_restrict=5;
                             break;
						case 9:
                             this_aspect=113;
                             next_restrict=5;
                             break;
						case 10:
                             this_aspect=T_VER_CL;
                             next_restrict=5;
                             break;
						default:;
						}
						break;
					case 13:
						switch (restriction)
						{
						case 4:
                             this_aspect=115;
                             next_restrict=R_VS;
                             break;
						case 5:
                             this_aspect=116;
                             next_restrict=R_VS;
                             break;
						case 6:
                             this_aspect=117;
                             next_restrict=R_VS;
                             break;
						case 7:
                             this_aspect=111;
                             next_restrict=6;
                             break;
						case 8:
                             this_aspect=112;
                             next_restrict=6;
                             break;
						case 9:
                             this_aspect=113;
                             next_restrict=6;
                             break;
						case 10:
                             this_aspect=T_VER_CL;
                             next_restrict=6;
                             break;
						default:;
						}
						break;
					case 14:
						switch (restriction)
						{
						case 4:
                             this_aspect=115;
                             next_restrict=R_VS;
                             break;
						case 5:
                             this_aspect=116;
                             next_restrict=R_VS;
                             break;
						case 6:
                             this_aspect=117;
                             next_restrict=R_VS;
                             break;
						case 7:
                             this_aspect=111;
                             next_restrict=6;
                             break;
						case 8:
                             this_aspect=112;
                             next_restrict=6;
                             break;
						case 9:
                             this_aspect=113;
                             next_restrict=6;
                             break;
						case 10:
                             this_aspect=T_VER_CL;
                             next_restrict=6;
                             break;
						default:;
						}
						break;
					case 19:
						switch (restriction)
						{
						case 4:
                             this_aspect=115;
                             next_restrict=R_VS;
                             break;
						case 5:
                             this_aspect=116;
                             next_restrict=R_VS;
                             break;
						case 6:
                             this_aspect=117;
                             next_restrict=R_VS;
                             break;
						case 7:
                             this_aspect=118;
                             next_restrict=R_VS;
                             break;
						case 8:
                             this_aspect=119;
                             next_restrict=R_VS;
                             break;
						case 9:
                             this_aspect=113;
                             next_restrict=8;
                             break;
						case 10:
                             this_aspect=T_VER_CL;
                             next_restrict=8;
                             break;
						default:;
						}
						break;
					case 20:
						switch (restriction)
						{
						case 4:
                             this_aspect=115;
                             next_restrict=R_VS;
                             break;
						case 5:
                             this_aspect=116;
                             next_restrict=R_VS;
                             break;
						case 6:
                             this_aspect=117;
                             next_restrict=R_VS;
                             break;
						case 7:
                             this_aspect=118;
                             next_restrict=R_VS;
                             break;
						case 8:
                             this_aspect=119;
                             next_restrict=R_VS;
                             break;
						case 9:
                             this_aspect=113;
                             next_restrict=8;
                             break;
						case 10:
                             this_aspect=T_VER_CL;
                             next_restrict=8;
                             break;
						default:;
						}
						break;
					case S_ROSU_AV:
						this_aspect=T_GALBEN;
						next_restrict=0;
						break;
					case S_ALB:
						this_aspect=T_VER_CL_20;
						next_restrict=R_T20;
						break;
					case S_CHEMARE:
						this_aspect=T_GALBEN_20;
						next_restrict=R_T20;
						break; 
					case 100:
						switch (restriction)
						{
						case 4:
                             this_aspect=115;
                             next_restrict=R_VS;
                             break;
						case 5:
                             this_aspect=116;
                             next_restrict=R_VS;
                             break;
						case 6:
                             this_aspect=117;
                             next_restrict=R_VS;
                             break;
						case 7:
                             this_aspect=118;
                             next_restrict=R_VS;
                             break;
						case 8:
                             this_aspect=119;
                             next_restrict=R_VS;
                             break;
						case 9:
                             this_aspect=120;
                             next_restrict=R_VS;
                             break;
						case 10:
                             this_aspect=T_VER_CL;
                             next_restrict=R_VS;
                             break;
						default:;
						}
						break;
               case 101:
                switch (restriction) {
                   case 4:
                             this_aspect=115;
                             next_restrict=R_VS;
                             break;
                   case 5:
                             this_aspect=109;
                             next_restrict=4;
                             break;
                   case 6:
                             this_aspect=110;
                             next_restrict=4;
                             break;
                   case 7:
                             this_aspect=111;
                             next_restrict=4;
                             break;
                   case 8:
                             this_aspect=112;
                             next_restrict=4;
                             break;
                   case 9:
                             this_aspect=113;
                             next_restrict=4;
                             break;
                   case 10:
                             this_aspect=T_VER_CL;
                             next_restrict=4;
                             break;
                   default:;
                }
                break;
               case 102:
                switch (restriction) {
                   case 4:
                             this_aspect=115;
                             next_restrict=R_VS;
                             break;
                   case 5:
                             this_aspect=116;
                             next_restrict=R_VS;
                             break;
                   case 6:
                             this_aspect=110;
                             next_restrict=5;
                             break;
                   case 7:
                             this_aspect=111;
                             next_restrict=5;
                             break;
                   case 8:
                             this_aspect=112;
                             next_restrict=5;
                             break;
                   case 9:
                             this_aspect=113;
                             next_restrict=5;
                             break;
                   case 10:
                             this_aspect=T_VER_CL;
                             next_restrict=5;
                             break;
                   default:;
                }
                break;
               case 103:
                switch (restriction) {
                   case 4:
                             this_aspect=115;
                             next_restrict=R_VS;
                             break;
                   case 5:
                             this_aspect=116;
                             next_restrict=R_VS;
                             break;
                   case 6:
                             this_aspect=117;
                             next_restrict=R_VS;
                             break;
                   case 7:
                             this_aspect=111;
                             next_restrict=6;
                             break;
                   case 8:
                             this_aspect=112;
                             next_restrict=6;
                             break;
                   case 9:
                             this_aspect=113;
                             next_restrict=6;
                             break;
                   case 10:
                             this_aspect=T_VER_CL;
                             next_restrict=6;
                             break;
                   default:;
                }
                break;
               case 104:
                switch (restriction) {
                   case 4:
                             this_aspect=115;
                             next_restrict=R_VS;
                             break;
                   case 5:
                             this_aspect=116;
                             next_restrict=R_VS;
                             break;
                   case 6:
                             this_aspect=117;
                             next_restrict=R_VS;
                             break;
                   case 7:
                             this_aspect=118;
                             next_restrict=R_VS;
                             break;
                   case 8:
                             this_aspect=112;
                             next_restrict=7;
                             break;
                   case 9:
                             this_aspect=113;
                             next_restrict=7;
                             break;
                   case 10:
                             this_aspect=T_VER_CL;
                             next_restrict=7;
                             break;
                   default:;
                }
                break;
               case 105:
                switch (restriction) {
                   case 4:
                             this_aspect=115;
                             next_restrict=R_VS;
                             break;
                   case 5:
                             this_aspect=116;
                             next_restrict=R_VS;
                             break;
                   case 6:
                             this_aspect=117;
                             next_restrict=R_VS;
                             break;
                   case 7:
                             this_aspect=118;
                             next_restrict=R_VS;
                             break;
                   case 8:
                             this_aspect=119;
                             next_restrict=R_VS;
                             break;
                   case 9:
                             this_aspect=113;
                             next_restrict=8;
                             break;
                   case 10:
                             this_aspect=T_VER_CL;
                             next_restrict=8;
                             break;
                   default:;
                }
                break;
               case 106:
                switch (restriction) {
                   case 4:
                             this_aspect=115;
                             next_restrict=R_VS;
                             break;
                   case 5:
                             this_aspect=116;
                             next_restrict=R_VS;
                             break;
                   case 6:
                             this_aspect=117;
                             next_restrict=R_VS;
                             break;
                   case 7:
                             this_aspect=118;
                             next_restrict=R_VS;
                             break;
                   case 8:
                             this_aspect=119;
                             next_restrict=R_VS;
                             break;
                   case 9:
                             this_aspect=120;
                             next_restrict=R_VS;
                             break;
                   case 10:
                             this_aspect=T_VER_CL;
                             next_restrict=9;
                             break;
                   default:;
                }
                break;
               case 107:
                switch (restriction) {
                   case 4:
                             this_aspect=115;
                             next_restrict=R_VS;
                             break;
                   case 5:
                             this_aspect=116;
                             next_restrict=R_VS;
                             break;
                   case 6:
                             this_aspect=117;
                             next_restrict=R_VS;
                             break;
                   case 7:
                             this_aspect=118;
                             next_restrict=R_VS;
                             break;
                   case 8:
                             this_aspect=119;
                             next_restrict=R_VS;
                             break;
                   case 9:
                             this_aspect=120;
                             next_restrict=R_VS;
                             break;
                   case 10:
                             this_aspect=T_VERDE;
                             next_restrict=R_VS;
                             break;
                   default:;
                }
                break;
               case 108:
                switch (restriction) {
                   case 4:
                             this_aspect=115;
                             next_restrict=R_VS;
                             break;
                   case 5:
                             this_aspect=109;
                             next_restrict=4;
                             break;
                   case 6:
                             this_aspect=110;
                             next_restrict=4;
                             break;
                   case 7:
                             this_aspect=111;
                             next_restrict=4;
                             break;
                   case 8:
                             this_aspect=112;
                             next_restrict=4;
                             break;
                   case 9:
                             this_aspect=113;
                             next_restrict=4;
                             break;
                   case 10:
                             this_aspect=T_VER_CL;
                             next_restrict=4;
                             break;
                   default:;
                }
                break;
               case 109:
                switch (restriction) {
                   case 4:
                             this_aspect=115;
                             next_restrict=R_VS;
                             break;
                   case 5:
                             this_aspect=116;
                             next_restrict=R_VS;
                             break;
                   case 6:
                             this_aspect=110;
                             next_restrict=5;
                             break;
                   case 7:
                             this_aspect=111;
                             next_restrict=5;
                             break;
                   case 8:
                             this_aspect=112;
                             next_restrict=5;
                             break;
                   case 9:
                             this_aspect=113;
                             next_restrict=5;
                             break;
                   case 10:
                             this_aspect=T_VER_CL;
                             next_restrict=5;
                             break;
                   default:;
                }
                break;
               case 110:
                switch (restriction) {
                   case 4:
                             this_aspect=115;
                             next_restrict=R_VS;
                             break;
                   case 5:
                             this_aspect=116;
                             next_restrict=R_VS;
                             break;
                   case 6:
                             this_aspect=117;
                             next_restrict=R_VS;
                             break;
                   case 7:
                             this_aspect=111;
                             next_restrict=6;
                             break;
                   case 8:
                             this_aspect=112;
                             next_restrict=6;
                             break;
                   case 9:
                             this_aspect=113;
                             next_restrict=6;
                             break;
                   case 10:
                             this_aspect=T_VER_CL;
                             next_restrict=6;
                             break;
                   default:;
                }
                break;
               case 111:
                switch (restriction) {
                   case 4:
                             this_aspect=115;
                             next_restrict=R_VS;
                             break;
                   case 5:
                             this_aspect=116;
                             next_restrict=R_VS;
                             break;
                   case 6:
                             this_aspect=117;
                             next_restrict=R_VS;
                             break;
                   case 7:
                             this_aspect=118;
                             next_restrict=R_VS;
                             break;
                   case 8:
                             this_aspect=112;
                             next_restrict=7;
                             break;
                   case 9:
                             this_aspect=113;
                             next_restrict=7;
                             break;
                   case 10:
                             this_aspect=T_VER_CL;
                             next_restrict=7;
                             break;
                   default:;
                }
                break;
               case 112:
                switch (restriction) {
                   case 4:
                             this_aspect=115;
                             next_restrict=R_VS;
                             break;
                   case 5:
                             this_aspect=116;
                             next_restrict=R_VS;
                             break;
                   case 6:
                             this_aspect=117;
                             next_restrict=R_VS;
                             break;
                   case 7:
                             this_aspect=118;
                             next_restrict=R_VS;
                             break;
                   case 8:
                             this_aspect=119;
                             next_restrict=R_VS;
                             break;
                   case 9:
                             this_aspect=113;
                             next_restrict=8;
                             break;
                   case 10:
                             this_aspect=T_VER_CL;
                             next_restrict=8;
                             break;
                   default:;
                }
                break;
               case 113:
                switch (restriction) {
                   case 4:
                             this_aspect=115;
                             next_restrict=R_VS;
                             break;
                   case 5:
                             this_aspect=116;
                             next_restrict=R_VS;
                             break;
                   case 6:
                             this_aspect=117;
                             next_restrict=R_VS;
                             break;
                   case 7:
                             this_aspect=118;
                             next_restrict=R_VS;
                             break;
                   case 8:
                             this_aspect=119;
                             next_restrict=R_VS;
                             break;
                   case 9:
                             this_aspect=120;
                             next_restrict=R_VS;
                             break;
                   case 10:
                             this_aspect=T_VER_CL;
                             next_restrict=9;
                             break;
                   default:;
                }
                break;
               case 114:
                switch (restriction) {
                   case 4:
                             this_aspect=115;
                             next_restrict=R_VS;
                             break;
                   case 5:
                             this_aspect=116;
                             next_restrict=R_VS;
                             break;
                   case 6:
                             this_aspect=117;
                             next_restrict=R_VS;
                             break;
                   case 7:
                             this_aspect=118;
                             next_restrict=R_VS;
                             break;
                   case 8:
                             this_aspect=119;
                             next_restrict=R_VS;
                             break;
                   case 9:
                             this_aspect=120;
                             next_restrict=R_VS;
                             break;
                   case 10:
                             this_aspect=T_VERDE;
                             next_restrict=R_VS;
                             break;
                   default:;
                }
                break;
               case 115:
                switch (restriction) {
                   case 4:
                             this_aspect=115;
                             next_restrict=R_VS;
                             break;
                   case 5:
                             this_aspect=109;
                             next_restrict=4;
                             break;
                   case 6:
                             this_aspect=110;
                             next_restrict=4;
                             break;
                   case 7:
                             this_aspect=111;
                             next_restrict=4;
                             break;
                   case 8:
                             this_aspect=112;
                             next_restrict=4;
                             break;
                   case 9:
                             this_aspect=113;
                             next_restrict=4;
                             break;
                   case 10:
                             this_aspect=T_VER_CL;
                             next_restrict=4;
                             break;
                   default:;
                }
                break;
               case 116:
                switch (restriction) {
                   case 4:
                             this_aspect=115;
                             next_restrict=R_VS;
                             break;
                   case 5:
                             this_aspect=116;
                             next_restrict=R_VS;
                             break;
                   case 6:
                             this_aspect=110;
                             next_restrict=5;
                             break;
                   case 7:
                             this_aspect=111;
                             next_restrict=5;
                             break;
                   case 8:
                             this_aspect=112;
                             next_restrict=5;
                             break;
                   case 9:
                             this_aspect=113;
                             next_restrict=5;
                             break;
                   case 10:
                             this_aspect=T_VER_CL;
                             next_restrict=5;
                             break;
                   default:;
                }
                break;
               case 117:
                switch (restriction) {
                   case 4:
                             this_aspect=115;
                             next_restrict=R_VS;
                             break;
                   case 5:
                             this_aspect=116;
                             next_restrict=R_VS;
                             break;
                   case 6:
                             this_aspect=117;
                             next_restrict=R_VS;
                             break;
                   case 7:
                             this_aspect=111;
                             next_restrict=6;
                             break;
                   case 8:
                             this_aspect=112;
                             next_restrict=6;
                             break;
                   case 9:
                             this_aspect=113;
                             next_restrict=6;
                             break;
                   case 10:
                             this_aspect=T_VER_CL;
                             next_restrict=6;
                             break;
                   default:;
                }
                break;
               case 118:
                switch (restriction) {
                   case 4:
                             this_aspect=115;
                             next_restrict=R_VS;
                             break;
                   case 5:
                             this_aspect=116;
                             next_restrict=R_VS;
                             break;
                   case 6:
                             this_aspect=117;
                             next_restrict=R_VS;
                             break;
                   case 7:
                             this_aspect=118;
                             next_restrict=R_VS;
                             break;
                   case 8:
                             this_aspect=112;
                             next_restrict=7;
                             break;
                   case 9:
                             this_aspect=113;
                             next_restrict=7;
                             break;
                   case 10:
                             this_aspect=T_VER_CL;
                             next_restrict=7;
                             break;
                   default:;
                }
                break;
               case 119:
                switch (restriction) {
                   case 4:
                             this_aspect=115;
                             next_restrict=R_VS;
                             break;
                   case 5:
                             this_aspect=116;
                             next_restrict=R_VS;
                             break;
                   case 6:
                             this_aspect=117;
                             next_restrict=R_VS;
                             break;
                   case 7:
                             this_aspect=118;
                             next_restrict=R_VS;
                             break;
                   case 8:
                             this_aspect=119;
                             next_restrict=R_VS;
                             break;
                   case 9:
                             this_aspect=113;
                             next_restrict=8;
                             break;
                   case 10:
                             this_aspect=T_VER_CL;
                             next_restrict=8;
                             break;
                   default:;
                }
                break;
					case 120:
						switch (restriction)
						{
						case 4:
                             this_aspect=115;
                             next_restrict=R_VS;
                             break;
                   case 5:
                             this_aspect=116;
                             next_restrict=R_VS;
                             break;
                   case 6:
                             this_aspect=117;
                             next_restrict=R_VS;
                             break;
                   case 7:
                             this_aspect=118;
                             next_restrict=R_VS;
                             break;
						case 8:
                             this_aspect=119;
                             next_restrict=R_VS;
                             break;
						case 9:
                             this_aspect=120;
                             next_restrict=R_VS;
                             break;
						case 10:
                             this_aspect=T_VER_CL;
                             next_restrict=9;
                             break;
						default:;
						}
						break;
					default:;
					}                                                                             
             
					//Daca e restrictie de manevra sau de chemare
					if (restriction==R_MANEVRA)
					{
						this_aspect=S_ALB;
						restriction=R_T20;
					}
					if (restriction==R_CHEMARE)
					{					
						this_aspect=S_CHEMARE;
						restriction=R_T20;
					}
			 
					if (Str.ToInt(ST.GetString("HAS_DIRECTION_MARKER")))
					{
						direction=FindDirection();
						Lightup_Direction_Marker();
					}

					if (this_aspect!=memo_aspect or next_restrict!=memo_restrict)
					{
						memo_aspect=this_aspect;
						memo_restrict=next_restrict;
						NotifySubscribers();
						Lights_Off();
						if (Str.ToInt(ST.GetString("HAS_BAR"))==1)
							TMV_this_limit(0);
						if (Str.ToInt(ST.GetString("HAS_BAR"))==2)
							TMV_next_limit(0);
						if (Str.ToInt(ST.GetString("HAS_BAR"))==3)
						{
							TMV_this_limit(0);
							TMV_next_limit(0);
						}
						
						//Daca este activata iesirea pe linia din stanga
						if (current_config_index!=-1)
							if (Str.ToInt(rules[current_config_index].exit_left))
								SetFXAttachment(B_LINIE,alblinie);
						
						if (this_aspect>=T_GALBEN and this_aspect<=T_GALBEN_100)
							SetFXAttachment(B_GALBEN,galben);
						if (this_aspect>=T_VER_CL and this_aspect<=T_VER_CL_100)
							if (Str.ToInt(ST.GetString("LIGHTS_COUNT"))==2) //Daca e TMV 2
								SetFXAttachment(B_GALBEN,galben);
							else
								SetFXAttachment(B_VERDE,verdeclipitor);
						if (this_aspect>=T_VERDE and this_aspect<=T_VERDE_100)
							if (Str.ToInt(ST.GetString("LIGHTS_COUNT"))==2) //Daca e TMV 2
								SetFXAttachment(B_GALBEN,galben);
							else
								SetFXAttachment(B_VERDE,verde);
								
						if (this_aspect==S_ALB)
						{
							SetFXAttachment(B_ALB,alb);
						}
						if (this_aspect==S_CHEMARE)
						{
							SetFXAttachment(B_CHEMARE,albclipitor);
							SetFXAttachment(B_ROSU,rosu);
						}
						if (Str.ToInt(ST.GetString("HAS_BAR"))!=2 and restriction!=R_TVS)
						{
							TMV_this_limit(restriction);
						}
						if (Str.ToInt(ST.GetString("HAS_BAR"))>=2)
							TMV_next_limit(next_restrict);
					}
				}
			}
		}

		//BLA
		if (Str.ToInt(ST.GetString("SIGNAL_TMV_LINE_BLOCK")))
		{
			if (GetSignalState()==RED) 
			{
				this_aspect=S_ROSU;
				if (this_aspect!=memo_aspect)
				{
					NotifySubscribers();
					memo_aspect=S_ROSU;
					Lights_Off();
					if (Str.ToInt(ST.GetString("HAS_BAR"))==1) 
						TMV_this_limit(0);
					if (Str.ToInt(ST.GetString("HAS_BAR"))==2) 
						TMV_next_limit(0);
					if (Str.ToInt(ST.GetString("HAS_BAR"))==3) 
					{
						TMV_this_limit(0);
						TMV_next_limit(0);
					}
					SetFXAttachment(B_ROSU,rosu);
				}
			}
			else
			{  
				if(!active_fault)
				{
					
					switch (next_aspect)
					{
					case S_ROSU:
						this_aspect=T_GALBEN;
						next_restrict=R_VS;
						break;
					case S_GALBEN:
						this_aspect=T_VER_CL;
						next_restrict=R_VS;
						break;
					case S_VERDE:
						this_aspect=T_VERDE;
						next_restrict=R_VS;
						break;
					case S_GAL_CL:
						this_aspect=T_VERDE;
						next_restrict=R_VS;
						break;
					case S_GAL_DCL:
						this_aspect=T_VERDE;
						next_restrict=R_VS;
						break;
					case S_VER_CL:
						this_aspect=T_VERDE;
						next_restrict=R_VS;
						break;
					case S_GAL_GAL:
						this_aspect=T_VER_CL;
						next_restrict=5;
						break;
					case S_VER_GAL:
						this_aspect=T_VER_CL;
						next_restrict=5;
						break;				
					case S_GAL_GAL_60:
						this_aspect=T_VER_CL;
						next_restrict=6;
						break;
					case S_VER_GAL_60:
						this_aspect=T_VER_CL;
						next_restrict=6;
						break;
					case S_GAL_GAL_90:
						this_aspect=T_VER_CL;
						next_restrict=8;
						break;
					case S_VER_GAL_90:
						this_aspect=T_VER_CL;
						next_restrict=8;
						break;
					case S_ROSU_AV:
						this_aspect=T_GALBEN;
						next_restrict=0;
						break;
					case S_ALB:
						this_aspect=T_VER_CL_20;
						next_restrict=R_T20;
						break;
					case S_CHEMARE:
						this_aspect=T_GALBEN_20;
						next_restrict=R_T20;
						break; 
					case T_GALBEN:
						this_aspect=T_VER_CL;
						next_restrict=R_VS;
						break;
					case T_GALBEN_20:
						this_aspect=T_VER_CL;
						next_restrict=R_T20;
						break;
					case T_GALBEN_30:
						this_aspect=T_VER_CL;
						next_restrict=R_T30;
						break;
					case T_GALBEN_60:
						this_aspect=T_VER_CL;
						next_restrict=R_T60;
						break;
					case T_GALBEN_80:
						this_aspect=T_VER_CL;
						next_restrict=R_T80;
						break;
					case T_GALBEN_90:
						this_aspect=T_VER_CL;
						next_restrict=R_T90;
						break;
					case T_GALBEN_100:
						this_aspect=T_VER_CL;
						next_restrict=R_T100;
						break;
					case T_VER_CL:
						this_aspect=T_VERDE;
						next_restrict=R_VS;
						break;
					case T_VER_CL_20:
						this_aspect=T_VER_CL;
						next_restrict=4;
						break;
					case T_VER_CL_30:
						this_aspect=T_VER_CL;
						next_restrict=5;
						break;
					case T_VER_CL_60:
						this_aspect=T_VER_CL;
						next_restrict=6;
						break;
					case T_VER_CL_80:
						this_aspect=T_VER_CL;
						next_restrict=7;
						break;
					case T_VER_CL_90:
						this_aspect=T_VER_CL;
						next_restrict=8;
						break;
					case T_VER_CL_100:
						this_aspect=T_VER_CL;
						next_restrict=9;
						break;
					case T_VERDE:
						this_aspect=T_VERDE;
						next_restrict=R_VS;
						break;
					case T_VERDE_20:
						this_aspect=T_VER_CL;
						next_restrict=4;
						break;
					case T_VERDE_30:
						this_aspect=T_VER_CL;
						next_restrict=5;
						break;
					case T_VERDE_60:
						this_aspect=T_VER_CL;
						next_restrict=6;
						break;
					case T_VERDE_80:
						this_aspect=T_VER_CL;
						next_restrict=7;
						break;
					case T_VERDE_90:
						this_aspect=T_VER_CL;
						next_restrict=8;
						break;
					case T_VERDE_100:
						this_aspect=T_VER_CL;
						next_restrict=R_T100;
						break;
					default:;
					}                                                                             
             
					if (this_aspect!=memo_aspect or next_restrict!=memo_restrict)
					{
						memo_aspect=this_aspect;
						memo_restrict=next_restrict;
						NotifySubscribers();
						Lights_Off();
						if (Str.ToInt(ST.GetString("HAS_BAR"))==2)
							TMV_next_limit(0);
						if (this_aspect>=T_GALBEN and this_aspect<=T_GALBEN_100)
							SetFXAttachment(B_GALBEN,galben);
						if (this_aspect>=T_VER_CL and this_aspect<=T_VER_CL_100)
							SetFXAttachment(B_VERDE,verdeclipitor);
						if (this_aspect>=T_VERDE and this_aspect<=T_VERDE_100)
							SetFXAttachment(B_VERDE,verde);
						if (Str.ToInt(ST.GetString("HAS_BAR"))==2)
							TMV_next_limit(next_restrict);
					}
				}
			}
		}

		//PREVESTITOR
		if (Str.ToInt(ST.GetString("SIGNAL_TMV_DISTANT")))
		{
			switch (next_aspect)
			{
			case 0:
				 this_aspect=T_GALBEN;
				 next_restrict=R_VS;
				 break;
			case 1:
				 this_aspect=T_VER_CL;
				 next_restrict=R_VS;
				 break;
			   case 2:
				 this_aspect=T_VERDE;
				 next_restrict=R_VS;
				 break;
			   case 3:
				 this_aspect=T_VERDE;
				 next_restrict=R_VS;
				 break;
			   case 4:
				 this_aspect=T_VERDE;
				 next_restrict=R_VS;
				 break;
			   case 6:
				 this_aspect=T_VERDE;
				 next_restrict=R_VS;
				 break;
			   case 7:
				 this_aspect=T_VER_CL;
				 next_restrict=5;
				 break;
			   case 8:
				 this_aspect=T_VER_CL;
				 next_restrict=5;
				 break;
			   case 13:
				 this_aspect=T_VER_CL;
				 next_restrict=6;
				 break;
			   case 14:
				 this_aspect=T_VER_CL;
				 next_restrict=6;
				 break;
			   case 19:
				 this_aspect=T_VER_CL;
				 next_restrict=8;
				 break;
			   case 20:
				 this_aspect=T_VER_CL;
				 next_restrict=8;
				 break;
			case S_ROSU_AV:
				this_aspect=T_GALBEN;
				next_restrict=0;
				break;
			case S_ALB:
				this_aspect=T_VER_CL_20;
				next_restrict=R_T20;
				break;
			case S_CHEMARE:
				this_aspect=T_GALBEN_20;
				next_restrict=R_T20;
				break; 
			case 100:
				 this_aspect=T_VER_CL;
				 next_restrict=R_VS;
				 break;
			   case 101:
				 this_aspect=T_VER_CL;
				 next_restrict=4;
				 break;
			   case 102:
				 this_aspect=T_VER_CL;
				 next_restrict=5;
				 break;
			   case 103:
				 this_aspect=T_VER_CL;
				 next_restrict=6;
				 break;
			   case 104:
				 this_aspect=T_VER_CL;
				 next_restrict=7;
				 break;
			   case 105:
				 this_aspect=T_VER_CL;
				 next_restrict=8;
				 break;
			   case 106:
				 this_aspect=T_VER_CL;
				 next_restrict=9;
				 break;
			   case 107:
				 this_aspect=T_VERDE;
				 next_restrict=R_VS;
				 break;
			   case 108:
				 this_aspect=T_VER_CL;
				 next_restrict=4;
				 break;
			   case 109:
				 this_aspect=T_VER_CL;
				 next_restrict=5;
				 break;
			   case 110:
				 this_aspect=T_VER_CL;
				 next_restrict=6;
				 break;
			   case 111:
				 this_aspect=T_VER_CL;
				 next_restrict=7;
				 break;
			   case 112:
				 this_aspect=T_VER_CL;
				 next_restrict=8;
				 break;
			   case 113:
				 this_aspect=T_VER_CL;
				 next_restrict=9;
				 break;
			   case 114:
				 this_aspect=T_VERDE;
				 next_restrict=R_VS;
				 break;
			   case 115:
				 this_aspect=T_VER_CL;
				 next_restrict=4;
				 break;
			   case 116:
				 this_aspect=T_VER_CL;
				 next_restrict=5;
				 break;
			   case 117:
				 this_aspect=T_VER_CL;
				 next_restrict=6;
				 break;
			   case 118:
				 this_aspect=T_VER_CL;
				 next_restrict=7;
				 break;
			   case 119:
				 this_aspect=T_VER_CL;
				 next_restrict=8;
				 break;
			case 120:
				this_aspect=T_VER_CL;
				next_restrict=9;
				break;
			default:;
			}                                                                          
			 
			if (this_aspect!=memo_aspect or next_restrict!=memo_restrict)
			{
				memo_aspect=this_aspect;
				memo_restrict=next_restrict;
				NotifySubscribers();
				Lights_Off();
				if (Str.ToInt(ST.GetString("HAS_BAR"))==2)
					TMV_next_limit(0);
				if (this_aspect>=T_GALBEN and this_aspect<=T_GALBEN_100)
					SetFXAttachment(B_GALBEN,galben);
				if (this_aspect>=T_VER_CL and this_aspect<=T_VER_CL_100)
					SetFXAttachment(B_VERDE,verdeclipitor);
				if (this_aspect>=T_VERDE and this_aspect<=T_VERDE_100)
					SetFXAttachment(B_VERDE,verde);
				if (Str.ToInt(ST.GetString("HAS_BAR"))==2)
					TMV_next_limit(next_restrict);
			}
		}

		//REPETITOR
		if (Str.ToInt(ST.GetString("SIGNAL_TMV_REPEATER")))
		{
			this_aspect=next_aspect;                                                                              
			if (this_aspect!=memo_aspect)
			{
				memo_aspect=this_aspect;
				NotifySubscribers();
				Lights_Off();
				
				//rosu
				if (this_aspect==S_ROSU)
				{
					SetFXAttachment("50",albmic);
					SetFXAttachment("51",albmic);
					SetFXAttachment("52",albmic);
					SetFXAttachment("53",albmic);
					SetFXAttachment("57",albmic);
					SetFXAttachment("58",albmic);
					SetFXAttachment("59",albmic);
				}
				
				//galben
				if (this_aspect==S_GALBEN or this_aspect>=S_GAL_CL and this_aspect<=T_VER_CL_100) 
				{
					SetFXAttachment("50",albmic);
					SetFXAttachment("51",albmic);
					SetFXAttachment("52",albmic);
					SetFXAttachment("53",albmic);
					SetFXAttachment("54",albmic);
					SetFXAttachment("55",albmic);
					SetFXAttachment("56",albmic);
				}
				
				//verde
				if (this_aspect==S_VERDE or this_aspect>=T_VERDE)
				{
					SetFXAttachment("50",albmic);
					SetFXAttachment("51",albmic);
					SetFXAttachment("52",albmic);
					SetFXAttachment("53",albmic);
					SetFXAttachment("60",albmic);
					SetFXAttachment("61",albmic);
					SetFXAttachment("62",albmic);
				}
			}
		} 

		//MANEVRA
		if (Str.ToInt(ST.GetString("SIGNAL_TMV_SHUNT")))
		{
			//Daca a trecut trenul de semnal si nu e de I/E pune albastru
			if (!Str.ToInt(ST.GetString("SIGNAL_TMV_EXITENTRY")) and GetSignalState()==RED)
			{
				this_aspect=next_aspect;
				if (this_aspect!=memo_aspect)
				{
					memo_aspect=this_aspect;
					NotifySubscribers();
					Lights_Off();
					SetFXAttachment(B_ALBASTRU,albastru);
				}
			}
			
			//Daca nu e manevra permisa si nu e de I/E pune albastru
			if (!active_shunt and !Str.ToInt(ST.GetString("SIGNAL_TMV_EXITENTRY")))
			{
				this_aspect=next_aspect;
				if (this_aspect!=memo_aspect)
				{
					memo_aspect=this_aspect;
					NotifySubscribers();
					Lights_Off();
					SetFXAttachment(B_ALBASTRU,albastru);
				}
			}
			
			//Daca e activa manevra si e liber pune alb
			if (active_shunt and !(GetSignalState()==RED))
			{
				if (this_aspect!=S_ALB)
				{
					this_aspect=S_ALB;
					memo_aspect=S_ALB;
					NotifySubscribers();
					Lights_Off();
					if (Str.ToInt(ST.GetString("HAS_DIRECTION_MARKER"))) 
					{
						direction=0;
						Lightup_Direction_Marker();
					}
					SetSpeedLimit(20/3.6);
					SetFXAttachment(B_ALB,alb);
				}
			}
		}	
	
		//AVARIE
		if (Str.ToInt(ST.GetString("SIGNAL_TMV_FAULT")))
		{
			if (!active_fault and !Str.ToInt(ST.GetString("SIGNAL_TMV_LINE_BLOCK")))
			{
				this_aspect=next_aspect;
				if (this_aspect!=memo_aspect)
				{
					memo_aspect=this_aspect;
					NotifySubscribers();
					Lights_Off();
					
				}
			}
			if (active_fault)
			{
				if (this_aspect!=S_ROSU_AV)
				{
					this_aspect=S_ROSU_AV;
					memo_aspect=S_ROSU_AV;
					NotifySubscribers();
					Lights_Off();
					SetFXAttachment(B_ROSU_AV,rosu);
				}
			}
		} 
	}

	void SignalControl_MEC(void)
	{
		//INTRARE si IESIRE 1i
		if (Str.ToInt(ST.GetString("SIGNAL_MEC_EXITENTRY")) and Str.ToInt(ST.GetString("LIGHTS_COUNT"))==1)
		{
			if (GetSignalState()==RED) 
			{
				this_aspect=S_ROSU;
				if (this_aspect!=memo_aspect)
				{
					NotifySubscribers();
					memo_aspect=this_aspect;
					Lights_Off();
					SetFXCoronaTexture(B_ROSU,rosu);
					SetMeshAnimationFrame("default",0,1);
				}
			}
			else
			{
				this_aspect=S_VERDE;
					
				if (this_aspect!=memo_aspect)
				{
					NotifySubscribers();
					memo_aspect=this_aspect;
					Lights_Off();
					SetMeshAnimationFrame("default",30,1);
					SetFXCoronaTexture(B_ROSU,verde);
				}
			}
		}
		
		//INTRARE si IESIRE 2i
		if (Str.ToInt(ST.GetString("SIGNAL_MEC_EXITENTRY")) and Str.ToInt(ST.GetString("LIGHTS_COUNT"))==2)
		{
			if (GetSignalState()==RED) 
			{
				this_aspect=S_ROSU;
				if (this_aspect!=memo_aspect)
				{
					NotifySubscribers();
					memo_aspect=this_aspect;
					Lights_Off();
					SetFXCoronaTexture(B_ROSU,rosu);
					SetMeshAnimationFrame("default",60,1);
				}
			}
			else
			{
				restriction=FindLimit();
				
				if (restriction==R_30)
					this_aspect=S_VER_GAL;
				else
					this_aspect=S_VERDE;
					
				if (this_aspect!=memo_aspect)
				{
					NotifySubscribers();
					memo_aspect=this_aspect;
					Lights_Off();
					
					if (this_aspect==S_VER_GAL)
					{
						SetMeshAnimationFrame("default",90,1);
						SetFXCoronaTexture(B_ROSU,verde);
						SetFXCoronaTexture(B_GALBEN,galben);
					}
					else
					{
						SetMeshAnimationFrame("default",30,1);
						SetFXCoronaTexture(B_ROSU,verde);
					}
				}
			}
		}
		
		//INTRARE si IESIRE 3i
		if (Str.ToInt(ST.GetString("SIGNAL_MEC_EXITENTRY")) and Str.ToInt(ST.GetString("LIGHTS_COUNT"))==3)
		{
			if (GetSignalState()==RED) 
			{
				this_aspect=S_ROSU;
				if (this_aspect!=memo_aspect)
				{
					NotifySubscribers();
					memo_aspect=this_aspect;
					Lights_Off();
					SetFXCoronaTexture(B_ROSU,rosu);
					SetFXCoronaTexture(B_GAL_JOS,galben);
					SetMeshAnimationFrame("default",60,1);
					SetMeshAnimationFrame("paleta",0,2);
				}
			}
			else
			{
				switch (next_aspect)
				{
				case S_ROSU:
					this_aspect=S_GALBEN;
					break;
				case S_GALBEN:
					this_aspect=S_VERDE;
					break;
				case S_VERDE:
					this_aspect=S_VERDE;
					break;
				case S_GAL_CL:
					this_aspect=S_VERDE;
					break;
				case S_GAL_DCL:
					this_aspect=S_VERDE;
					break;
				case S_VER_CL:
					this_aspect=S_VERDE;
					break;
				case S_GAL_GAL:
					this_aspect=S_VERDE;
					break;
				case S_VER_GAL:
					this_aspect=S_VERDE;
					break;
				case S_GAL_GAL_60:
					this_aspect=S_VERDE;
					break;
				case S_VER_GAL_60:
					this_aspect=S_VERDE;
					break;
				case S_GAL_GAL_90:
					this_aspect=S_VERDE;
					break;
				case S_VER_GAL_90:
					this_aspect=S_VERDE;
					break;
				case S_ROSU_AV:
					this_aspect=S_GALBEN;
					break;
				case S_ALB:
					this_aspect=S_VERDE;
					break;
				case S_CHEMARE:
					this_aspect=S_GALBEN;
					break;
				default:;
				}
				
				if (next_aspect>=100)
					this_aspect=S_VERDE;

				restriction=FindLimit();
				if (restriction==R_30)
				{
					if (this_aspect>1)
						this_aspect=S_VERDE;
					this_aspect = this_aspect + 6;                         
				}	                                

				if (this_aspect!=memo_aspect)
				{
					NotifySubscribers();
					memo_aspect=this_aspect;
					Lights_Off();

					switch (this_aspect)
					{
					case S_GALBEN:
						SetFXCoronaTexture(B_ROSU,verde);
						SetFXCoronaTexture(B_GAL_JOS,galben);
						SetMeshAnimationFrame("default",30,1);
						SetMeshAnimationFrame("paleta",0,2);
						break;
					case S_VERDE:
						SetFXCoronaTexture(B_ROSU,verde);
						SetFXCoronaTexture(B_GAL_JOS,verde);
						SetMeshAnimationFrame("default",30,1);
						SetMeshAnimationFrame("paleta",120,2);
						break;
					case S_GAL_GAL:
						SetFXCoronaTexture(B_ROSU,verde);
						SetFXCoronaTexture(B_GALBEN,galben);
						SetFXCoronaTexture(B_GAL_JOS,galben);
						SetMeshAnimationFrame("default",90,1);
						SetMeshAnimationFrame("paleta",0,2);
						SetSpeedLimit(30/3.6);
						break;
					case S_VER_GAL:
						SetFXCoronaTexture(B_ROSU,verde);
						SetFXCoronaTexture(B_GALBEN,galben);
						SetFXCoronaTexture(B_GAL_JOS,verde);
						SetMeshAnimationFrame("default",90,1);
						SetMeshAnimationFrame("paleta",120,2);
						SetSpeedLimit(30/3.6);
						break;
					default:;
					}
				}
			}
		}
		
		//PREVESTITOR 2i
		if (Str.ToInt(ST.GetString("SIGNAL_MEC_DISTANT")) and Str.ToInt(ST.GetString("LIGHTS_COUNT"))==1)
		{
			switch (next_aspect)
			{
            case S_ROSU:
                this_aspect=S_GALBEN;
                break;
            case S_GALBEN:
				this_aspect=S_VERDE;
                break;
            case S_VERDE:
                this_aspect=S_VERDE;
                break;
            case S_GAL_CL:
                this_aspect=S_VERDE;
                break;
            case S_GAL_DCL:
                this_aspect=S_VERDE;
                break;
            case S_VER_CL:
                this_aspect=S_VERDE;
                break;
            case S_GAL_GAL:
                this_aspect=S_GALBEN;
                break;
            case S_VER_GAL:
                this_aspect=S_GALBEN;
                break;
            case S_GAL_GAL_60:
                this_aspect=S_GALBEN;
                break;
            case S_VER_GAL_60:
                this_aspect=S_GALBEN;
                break;
            case S_GAL_GAL_90:
                this_aspect=S_GALBEN;
                break;
            case S_VER_GAL_90:
                this_aspect=S_GALBEN;
                break; 
			case S_ROSU_AV:
				this_aspect=S_GALBEN;
				break;
			case S_ALB:
				this_aspect=S_VERDE;
				break;
			case S_CHEMARE:
				this_aspect=S_GALBEN;
				break;
            default:;
			}
			
			if (next_aspect>=100)
				this_aspect=S_VERDE;   
				
			if (this_aspect!=memo_aspect)
			{
				NotifySubscribers();
				memo_aspect=this_aspect;
				Lights_Off();
				switch (this_aspect)
				{
				case S_GALBEN:
					SetMeshAnimationFrame("default",0,2);
					SetFXCoronaTexture(B_GALBEN,galben);
					break;
				case S_VERDE:
					SetMeshAnimationFrame("default",120,2);
					SetFXCoronaTexture(B_GALBEN,verde);
					break;
				default:;
				}
			}
		}
		
		//PREVESTITOR 3i
		if (Str.ToInt(ST.GetString("SIGNAL_MEC_DISTANT")) and Str.ToInt(ST.GetString("LIGHTS_COUNT"))==2)
		{
			switch (next_aspect)
			{
            case S_ROSU:
                this_aspect=S_GALBEN;
                break;
            case S_GALBEN:
				this_aspect=S_VERDE;
                break;
            case S_VERDE:
                this_aspect=S_VERDE;
                break;
            case S_GAL_CL:
                this_aspect=S_VERDE;
                break;
            case S_GAL_DCL:
                this_aspect=S_VERDE;
                break;
            case S_VER_CL:
                this_aspect=S_VERDE;
                break;
            case S_GAL_GAL:
                this_aspect=S_GAL_GAL;
                break;
            case S_VER_GAL:
                this_aspect=S_GAL_GAL;
                break;
            case S_GAL_GAL_60:
                this_aspect=S_GAL_GAL;
                break;
            case S_VER_GAL_60:
                this_aspect=S_GAL_GAL;
                break;
            case S_GAL_GAL_90:
                this_aspect=S_GAL_GAL;
                break;
            case S_VER_GAL_90:
                this_aspect=S_GAL_GAL;
                break; 
			case S_ROSU_AV:
				this_aspect=S_GALBEN;
				break;
			case S_ALB:
				this_aspect=S_VERDE;
				break;
			case S_CHEMARE:
				this_aspect=S_GALBEN;
				break;
            default:;
			}
			
			if (next_aspect>=100)
				this_aspect=S_VERDE;   
				
			if (this_aspect!=memo_aspect)
			{
				NotifySubscribers();
				memo_aspect=this_aspect;
				Lights_Off();
				switch (this_aspect)
				{
				case S_GALBEN:
					SetMeshAnimationFrame("default",0,2);
					SetMeshAnimationFrame("paleta",60,1);
					SetFXCoronaTexture(B_GALBEN,galben);
					break;
				case S_VERDE:
					SetMeshAnimationFrame("default",120,2);
					SetMeshAnimationFrame("paleta",60,1);
					SetFXCoronaTexture(B_GALBEN,verde);
					break;
				case S_GAL_GAL:
					SetMeshAnimationFrame("default",0,2);
					SetMeshAnimationFrame("paleta",90,1);
					SetFXCoronaTexture(B_GALBEN,galben);
					SetFXCoronaTexture(B_GAL_JOS,galben);
					break;
				default:;
				}
			}
		}
		
		//REPETITOR
		if (Str.ToInt(ST.GetString("SIGNAL_MEC_REPEATER")))
		{
			this_aspect=next_aspect;
			
			if (this_aspect!=memo_aspect)
			{
				memo_aspect=this_aspect;
				NotifySubscribers();
				Lights_Off();
				
				if (this_aspect==S_ROSU)
				{
					SetMeshAnimationFrame("default",0,1);
					SetFXCoronaTexture(B_GALBEN,galben);
				}
				else
				{
					SetMeshAnimationFrame("default",30,1);
					SetFXCoronaTexture(B_GALBEN,verde);
				}
			}
		}
		
		//MANEVRA
		if (Str.ToInt(ST.GetString("SIGNAL_MEC_SHUNT")))
		{
			//Daca a trecut trenul de semnal si nu e de I/E pune albastru
			if (!Str.ToInt(ST.GetString("SIGNAL_MEC_EXITENTRY")) and GetSignalState()==RED)
			{
				this_aspect=next_aspect;
				if (this_aspect!=memo_aspect)
				{
					memo_aspect=this_aspect;
					NotifySubscribers();
					Lights_Off();
					SetFXCoronaTexture(B_ALB,albastru);
					SetMeshAnimationFrame("default",0,1);
				}
			}
			
			//Daca nu e manevra permisa si nu e de I/E pune albastru
			if (!active_shunt and !Str.ToInt(ST.GetString("SIGNAL_MEC_EXITENTRY")))
			{
				this_aspect=next_aspect;
				if (this_aspect!=memo_aspect)
				{
					memo_aspect=this_aspect;
					NotifySubscribers();
					Lights_Off();
					SetFXCoronaTexture(B_ALB,albastru);
					SetMeshAnimationFrame("default",0,1);
				}
			}
			
			//Daca e activa manevra si e liber pune alb
			if (active_shunt and !(GetSignalState()==RED))
			{
				if (this_aspect!=S_ALB)
				{
					this_aspect=S_ALB;
					memo_aspect=S_ALB;
					NotifySubscribers();
					Lights_Off();
					SetSpeedLimit(20/3.6);
					SetFXCoronaTexture(B_ALB,alb);
					SetMeshAnimationFrame("default",30,1);
				}
			}
		} 
	}
	
	//Functia de aprindere a semnalelor DTV
	void SignalControl_DTV(void)
	{
		//INTRARE sau IESIRE DTV 2
		if (Str.ToInt(ST.GetString("SIGNAL_DTV_EXITENTRY")) and (Str.ToInt(ST.GetString("LIGHTS_COUNT"))==2))
		{
			if (GetSignalState()==RED) 
			{
				this_aspect=S_ROSU;
				if (this_aspect!=memo_aspect)
				{
					NotifySubscribers();
					memo_aspect=S_ROSU;
					Lights_Off();
					SetFXAttachment(B_ROSU,rosu);
				}
			}
			else
			{	
				//INTRARE
				if(Str.ToInt(ST.GetString("IS_ENTRY")))
				{
					this_aspect=S_CHEMARE; //Aspect de chemare
					
					if (this_aspect!=memo_aspect)
					{
						NotifySubscribers(); 
						memo_aspect=this_aspect;
						Lights_Off();
						SetFXAttachment(B_ROSU,rosu);
						SetFXAttachment(B_CHEMARE,albclipitor); 
						SetSpeedLimit(20/3.6);
					}
				}
				
				//IESIRE
				if(!Str.ToInt(ST.GetString("IS_ENTRY")))
				{
					this_aspect=S_ALB; //Aspect de manevra
					
					if (this_aspect!=memo_aspect)
					{
						NotifySubscribers(); 
						memo_aspect=this_aspect;
						Lights_Off();
						SetFXAttachment(B_ALB,alb);
						SetSpeedLimit(20/3.6);
					}
				}
			}
		}
		
		//INTRARE si IESIRE
		if (Str.ToInt(ST.GetString("SIGNAL_DTV_EXITENTRY")) and !(Str.ToInt(ST.GetString("LIGHTS_COUNT"))==2))
		{
			if (GetSignalState()==RED) 
			{
				this_aspect=S_ROSU;
				if (this_aspect!=memo_aspect)
				{
					NotifySubscribers();
					memo_aspect=S_ROSU;
					Lights_Off();
					if (Str.ToInt(ST.GetString("HAS_DIRECTION_MARKER")))
					{
						direction=0;
						Lightup_Direction_Marker();
					}
					SetFXAttachment(B_ROSU,rosu);
				}
			}
			else
			{
				if (!active_shunt)
				{
					
					switch (next_aspect)
					{
					case S_ROSU:
						this_aspect=S_GALBEN;
						break;
					case S_GALBEN:
						this_aspect=S_VERDE;
						break;
					case S_VERDE:
						this_aspect=S_VERDE;
						break;
					case S_GAL_CL:
						this_aspect=S_VERDE;
						break;
					case S_GAL_DCL:
						this_aspect=S_VERDE;
						break;
					case S_VER_CL:
						this_aspect=S_VERDE;
						break;
					case S_GAL_GAL:
						this_aspect=S_GAL_CL;
						break;
					case S_VER_GAL:
						this_aspect=S_GAL_CL;
						break;
					case S_GAL_GAL_60:
						this_aspect=S_GAL_CL;
						break;
					case S_VER_GAL_60:
						this_aspect=S_GAL_CL;
						break;
					case S_GAL_GAL_90:
						this_aspect=S_GAL_CL;
						break;
					case S_VER_GAL_90:
						this_aspect=S_GAL_CL;
						break;
					case S_ROSU_AV:
						this_aspect=S_GALBEN;
						break;
					case S_ALB:
						this_aspect=S_VERDE;
						break;
					case S_CHEMARE:
						this_aspect=S_GALBEN;
						break;
					default:;
					}
					
					if (next_aspect>=100)
						this_aspect=S_VERDE;
						
					if (Str.ToInt(ST.GetString("HAS_DIRECTION_MARKER")))
					{
						direction=FindDirection();
						if (direction==27 and this_aspect>1)
							direction=0;
						Lightup_Direction_Marker();
					}

					restriction=FindLimit();
					switch (restriction)
					{
					case R_30:
						if (this_aspect>1)
							this_aspect=S_VERDE;
						this_aspect = this_aspect + 6;                         
						break;
						
					case R_60: 
						if (this_aspect>1)
							this_aspect=S_VERDE;
						switch (Str.ToInt(ST.GetString("HAS_BAR")))
						{
						case 0:
							this_aspect=this_aspect + 6;
							break;                                     
						case 1: 
							this_aspect=this_aspect + 12;
							break;
						case 2:
							this_aspect=this_aspect + 6; 
							break;
						case 3:
							this_aspect=this_aspect + 12;
							break;
						default:;           
						}
						break;
						
					case R_90:
						if (this_aspect>1)
							this_aspect=S_VERDE;
						switch (Str.ToInt(ST.GetString("HAS_BAR")))
						{
						case 0:
							this_aspect=this_aspect + 6;
							break;                                     
						case 1: 
							this_aspect=this_aspect + 6;
							break;
						case 2:
							this_aspect=this_aspect + 18; 
							break;
						case 3:
							this_aspect=this_aspect + 18;
							break;
						default:;           
						}                          
						break;
					
					case R_MANEVRA:
						this_aspect=S_ALB;
						break;
					
					case R_CHEMARE:
						this_aspect=S_CHEMARE;
						break;
					default:;               
					}                                 

					if (this_aspect!=memo_aspect)
					{
						NotifySubscribers();
						memo_aspect=this_aspect;
						Lights_Off();
						
						//Daca este activata iesirea pe linia din stanga
						if (current_config_index!=-1)
							if (Str.ToInt(rules[current_config_index].exit_left))
								SetFXAttachment(B_LINIE,alblinie);

						switch (this_aspect)
						{
						case S_GALBEN:
							SetFXAttachment(B_GALBEN,galben);
							break;
						case S_VERDE:
							SetFXAttachment(B_VERDE,verde);
							break;
						case S_GAL_CL:
							SetFXAttachment(B_GALBEN,galbenclipitor);
							break;
						case S_GAL_GAL:
							SetFXAttachment(B_GALBEN,galben);
							SetFXAttachment(B_GAL_JOS,galben);
							SetSpeedLimit(30/3.6);
							break;
						case S_VER_GAL:
							SetFXAttachment(B_VERDE,verde);
							SetFXAttachment(B_GAL_JOS,galben);
							SetSpeedLimit(30/3.6);
							break;
						case S_GAL_GAL_60:
							SetFXAttachment(B_GALBEN,galben);
							SetFXAttachment(B_GAL_JOS,galben);
							SetFXAttachment("45",galbenmic);
							SetFXAttachment("46",galbenmic);
							SetFXAttachment("47",galbenmic);
							SetFXAttachment("48",galbenmic);
							SetSpeedLimit(60/3.6);
							break;
						case S_VER_GAL_60:
							SetFXAttachment(B_VERDE,verde);
							SetFXAttachment(B_GAL_JOS,galben);
							SetFXAttachment("45",galbenmic);
							SetFXAttachment("46",galbenmic);
							SetFXAttachment("47",galbenmic);
							SetFXAttachment("48",galbenmic);
							SetSpeedLimit(60/3.6);
							break;
						case S_GAL_GAL_90:
							SetFXAttachment(B_GALBEN,galben);
							SetFXAttachment(B_GAL_JOS,galben);
							SetFXAttachment("40",verdemic);
							SetFXAttachment("41",verdemic);
							SetFXAttachment("42",verdemic);
							SetFXAttachment("43",verdemic);
							SetSpeedLimit(90/3.6);
							break;
						case S_VER_GAL_90:
							SetFXAttachment(B_VERDE,verde);
							SetFXAttachment(B_GAL_JOS,galben);
							SetFXAttachment("40",verdemic);
							SetFXAttachment("41",verdemic);
							SetFXAttachment("42",verdemic);
							SetFXAttachment("43",verdemic);
							SetSpeedLimit(90/3.6);
							break;
						case S_ALB:
							SetFXAttachment(B_ALB,alb);
							SetSpeedLimit(20/3.6);
							break;
						case S_CHEMARE:
							SetFXAttachment(B_CHEMARE,albclipitor);
							SetFXAttachment(B_ROSU,rosu);
							SetSpeedLimit(20/3.6);
							break;
						default:;
						}
					}
				}
			}
		}

		//BLA
		if (Str.ToInt(ST.GetString("SIGNAL_DTV_LINE_BLOCK")))
		{
			if (GetSignalState()==RED) 
			{
				this_aspect=S_ROSU;
				if (this_aspect!=memo_aspect)
				{
					NotifySubscribers();
					memo_aspect=S_ROSU;
					Lights_Off();
					SetFXAttachment(B_ROSU,rosu);
				}
			}
			else
			{
				if (!active_fault)
				{
					
					switch (next_aspect)
					{
					case S_ROSU:
						this_aspect=S_GALBEN;
						break;
					case S_GALBEN:
						this_aspect=S_VERDE;
						break;
					case S_VERDE:
						this_aspect=S_VERDE;
						break;
					case S_GAL_CL:
						this_aspect=S_VERDE;
						break;
					case S_GAL_DCL:
						this_aspect=S_VERDE;
						break;
					case S_VER_CL:
						this_aspect=S_VERDE;
						break;
					case S_GAL_GAL:
						this_aspect=S_GAL_CL;
						break;
					case S_VER_GAL:
						this_aspect=S_GAL_CL;
						break;
					case S_GAL_GAL_60:
						this_aspect=S_GAL_DCL;
						break;
					case S_VER_GAL_60:
						this_aspect=S_GAL_DCL;
						break;
					case S_GAL_GAL_90:
						this_aspect=S_VER_CL;
						break;
					case S_VER_GAL_90:
						this_aspect=S_VER_CL;
						break;
					case S_ROSU_AV:
						this_aspect=S_GALBEN;
						break;
					case S_ALB:
						this_aspect=S_VERDE;
						break;
					case S_CHEMARE:
						this_aspect=S_GALBEN;
						break;
					default:;
					}  
					
					if (next_aspect>=100)	//Daca urmatorul e TMV
						this_aspect=S_VERDE;
						
					if (this_aspect!=memo_aspect)
					{
						NotifySubscribers(); 
						memo_aspect=this_aspect;
						Lights_Off();
						switch (this_aspect)
						{
						case S_GALBEN:
							SetFXAttachment(B_GALBEN,galben);
							break;
						case S_VERDE:
							SetFXAttachment(B_VERDE,verde);
							break;
						case S_GAL_CL:
							SetFXAttachment(B_GALBEN,galbenclipitor);
							break;
						case S_GAL_DCL:
							SetFXAttachment(B_GALBEN,galbenclipitor2);
							break;
						case S_VER_CL:
							SetFXAttachment(B_VERDE,verdeclipitor);
							break;
						default:;
						}
					}
				}
			}
		}

		//PREVESTITOR
		if (Str.ToInt(ST.GetString("SIGNAL_DTV_DISTANT")))
		{
			switch (next_aspect)
			{
            case S_ROSU:
                this_aspect=S_GALBEN;
                break;
            case S_GALBEN:
				this_aspect=S_VERDE;
                break;
            case S_VERDE:
                this_aspect=S_VERDE;
                break;
            case S_GAL_CL:
                this_aspect=S_VERDE;
                break;
            case S_GAL_DCL:
                this_aspect=S_VERDE;
                break;
            case S_VER_CL:
                this_aspect=S_VERDE;
                break;
            case S_GAL_GAL:
                this_aspect=S_GAL_CL;
                break;
            case S_VER_GAL:
                this_aspect=S_GAL_CL;
                break;
            case S_GAL_GAL_60:
                this_aspect=S_GAL_CL;
                break;
            case S_VER_GAL_60:
                this_aspect=S_GAL_CL;
                break;
            case S_GAL_GAL_90:
                this_aspect=S_GAL_CL;
                break;
            case S_VER_GAL_90:
                this_aspect=S_GAL_CL;
                break; 
			case S_ROSU_AV:
				this_aspect=S_GALBEN;
				break;
			case S_ALB:
				this_aspect=S_VERDE;
				break;
			case S_CHEMARE:
				this_aspect=S_GALBEN;
				break;
            default:;
			}
			
			if (next_aspect>=100)
				this_aspect=S_VERDE;   
				
			if (this_aspect!=memo_aspect)
			{
				NotifySubscribers();
				memo_aspect=this_aspect;
				Lights_Off();
				switch (this_aspect)
				{
				case S_GALBEN:
					SetFXAttachment(B_GALBEN,galben);
					break;
				case S_VERDE:
					SetFXAttachment(B_VERDE,verde);
					break;
				case S_GAL_CL:
					SetFXAttachment(B_GALBEN,galbenclipitor);
					break;
				default:;
				}
			}
		}

		//REPETITOR
		if (Str.ToInt(ST.GetString("SIGNAL_DTV_REPEATER")))
		{
			this_aspect=next_aspect;
			
			if (this_aspect!=memo_aspect)
			{
				memo_aspect=this_aspect;
				NotifySubscribers();
				Lights_Off();
				
				//rosu
				if (this_aspect==S_ROSU)
				{
					SetFXAttachment("50",albmic);
					SetFXAttachment("51",albmic);
					SetFXAttachment("52",albmic);
					SetFXAttachment("53",albmic);
					SetFXAttachment("57",albmic);
					SetFXAttachment("58",albmic);
					SetFXAttachment("59",albmic);
				}
				
				//galben
				if (this_aspect==S_GALBEN or this_aspect>=S_GAL_CL and this_aspect<=113) 
				{
					SetFXAttachment("50",albmic);
					SetFXAttachment("51",albmic);
					SetFXAttachment("52",albmic);
					SetFXAttachment("53",albmic);
					SetFXAttachment("54",albmic);
					SetFXAttachment("55",albmic);
					SetFXAttachment("56",albmic);
				}
				
				//verde
				if (this_aspect==S_VERDE or this_aspect>=114)
				{
					SetFXAttachment("50",albmic);
					SetFXAttachment("51",albmic);
					SetFXAttachment("52",albmic);
					SetFXAttachment("53",albmic);
					SetFXAttachment("60",albmic);
					SetFXAttachment("61",albmic);
					SetFXAttachment("62",albmic);
				}
			}
		}

		//MANEVRA
		if (Str.ToInt(ST.GetString("SIGNAL_DTV_SHUNT")))
		{
			//Daca a trecut trenul de semnal si nu e de I/E pune albastru
			if (!Str.ToInt(ST.GetString("SIGNAL_DTV_EXITENTRY")) and GetSignalState()==RED)
			{
				this_aspect=next_aspect;
				if (this_aspect!=memo_aspect)
				{
					memo_aspect=this_aspect;
					NotifySubscribers();
					Lights_Off();
					SetFXAttachment(B_ALBASTRU,albastru);
				}
			}
			
			//Daca nu e manevra permisa si nu e de I/E pune albastru
			if (!active_shunt and !Str.ToInt(ST.GetString("SIGNAL_DTV_EXITENTRY")))
			{
				this_aspect=next_aspect;
				if (this_aspect!=memo_aspect)
				{
					memo_aspect=this_aspect;
					NotifySubscribers();
					Lights_Off();
					SetFXAttachment(B_ALBASTRU,albastru);
				}
			}
			
			//Daca e activa manevra si e liber pune alb
			if (active_shunt and !(GetSignalState()==RED))
			{
				if (this_aspect!=S_ALB)
				{
					this_aspect=S_ALB;
					memo_aspect=S_ALB;
					NotifySubscribers();
					Lights_Off();
					if (Str.ToInt(ST.GetString("HAS_DIRECTION_MARKER"))) 
					{
						direction=0;
						Lightup_Direction_Marker();
					}
					SetSpeedLimit(20/3.6);
					SetFXAttachment(B_ALB,alb);
				}
			}
		} 

		//AVARIE
		if (Str.ToInt(ST.GetString("SIGNAL_DTV_FAULT")))
		{
			if (!active_fault and !Str.ToInt(ST.GetString("SIGNAL_DTV_LINE_BLOCK")))
			{
				this_aspect=next_aspect;
				if (this_aspect!=memo_aspect)
				{
					memo_aspect=this_aspect;
					NotifySubscribers();
					Lights_Off();
				}
			}
			if (active_fault)
			{
				if (this_aspect!=S_ROSU_AV)
				{
					this_aspect=S_ROSU_AV;
					memo_aspect=S_ROSU_AV;
					NotifySubscribers();
					Lights_Off();
					SetFXAttachment(B_ROSU_AV,rosu);
				}
			}
		} 
	}


	void Update(void)
	{	
		//Daca semnalul este scos din uz, ignora-l
		if (xxx)
		{
			Lights_Off();
			SetFXAttachment("xxx",GetAsset().FindAsset("xxx"));
			this_aspect=next_aspect;
			NotifySubscribers();
		}
		else
		{
			SetFXAttachment("xxx",null);
			if (use_instruction==1) SignalControl_DTV();
			if (use_instruction==2) SignalControl_MEC();
			if (use_instruction==3) SignalControl_TMV();     
		}
	}

	void SignalChange(Message msg)
	{
		Signal next;

		if (msg.src==me)
		{
			if (active_nextSignal==null or cast<Semnal>active_nextSignal==null)
			{
				switch (GetSignalState())
				{
				case YELLOW: 
					next_aspect=0;
					break;
				case GREEN:
					next_aspect=1;
					break;
				default:;
				}
			}
			Update();
		}
	}

	void JunctionChange(Message msg)
	{
		Semnal next_s;

		FindRuleIndex(msg.src);
		if (junction_querry_ok)
		{
			active_nextSignal=FindSignal();
			if (active_nextSignal)
				active_nextSignalName=active_nextSignal.GetName();
			if (active_nextSignal==null or cast<Semnal>active_nextSignal==null)
			{
				switch (GetSignalState())
				{
				case YELLOW: 
					next_aspect=0;
					break;
				case GREEN:
					next_aspect=1;
					break;
				default:;
				}
			}
			else
			{
				next_s=cast<Semnal>active_nextSignal;
				PostMessage(next_s,"TransmiteStare","",0);
			}
			Update();
		}
	}

	//Functia de manevra permisa
	void ShuntEnable(Message msg)
	{
		if (Str.ToInt(ST.GetString("SIGNAL_DTV_SHUNT")) or Str.ToInt(ST.GetString("SIGNAL_TMV_SHUNT")) or Str.ToInt(ST.GetString("SIGNAL_MEC_SHUNT")))
			active_shunt=1;
		Update();
	}
	
	//Functia de manevra interzisa
	void ShuntDisable(Message msg)
	{
		if (Str.ToInt(ST.GetString("SIGNAL_DTV_SHUNT")) or Str.ToInt(ST.GetString("SIGNAL_TMV_SHUNT")) or Str.ToInt(ST.GetString("SIGNAL_MEC_SHUNT")))
			active_shunt=0;
		Update();
	}

	//Functia de avarie pornita
	void FaultEnable(Message msg)
	{
		if (Str.ToInt(ST.GetString("SIGNAL_DTV_FAULT")) or Str.ToInt(ST.GetString("SIGNAL_TMV_FAULT")))
			active_fault=1;
		Update();
	}

	//Functia de avarie oprita
	void FaultDisable(Message msg)
	{
		if (Str.ToInt(ST.GetString("SIGNAL_DTV_FAULT")) or Str.ToInt(ST.GetString("SIGNAL_TMV_FAULT")))
			active_fault=0;
		Update();
	}
 
	//Functia de chemare pornita
	void CallEnable(Message msg)
	{
		if (Str.ToInt(ST.GetString("SIGNAL_DTV_EXITENTRY")) or Str.ToInt(ST.GetString("SIGNAL_TMV_EXITENTRY")))
			active_call=1;
		Update();
	}

	//Functia de chemare oprita
	void CallDisable(Message msg)
	{
		if (Str.ToInt(ST.GetString("SIGNAL_DTV_EXITENTRY")) or Str.ToInt(ST.GetString("SIGNAL_TMV_EXITENTRY")))
			active_call=0;
		Update();
	}
	
	void Notify(Message msg)
	{
		if (msg.src==active_nextSignal)
		{
			next_aspect=Str.ToInt(msg.minor);
			Update();
		}
	}

	void Transmit_State(Message msg)
	{
		NotifySubscribers();
	}

	void SubscribeTo(Signal signl)
	{
		if (signl!=null and cast<Semnal>signl)
			PostMessage(signl,"Semnal","Subscribe",0);
	}

	void UnsubscribeFrom(Signal signl)
	{
		if (signl!=null and cast<Semnal>signl)
			PostMessage(signl,"Semnal","UnSubscribe",0);
	}

	void Subscribe(Message msg)
	{
		int i;
		for (i=0; i<subscribers.size(); i++)
		{
			if (msg.src==subscribers[i])
				return;
		}
		subscribers[subscribers.size()]=msg.src;
		PostMessage(msg.src,"SchimbareAspect",this_aspect,0);
	}

	void UnSubscribe(Message msg)
	{
		int i;
		for (i=0; i<subscribers.size(); i++)
		{
			if (msg.src==subscribers[i])
			{ 
				subscribers[i,i+1]=null;
				return;
			}
		}
	}

	bool Check_Junction_Attack_Angle(Trackside c_from, Junction c_to, bool direct)
	{
		GSTrackSearch object_tree2;
		MapObject nextobject2, nextnextobject2;
		int junction_pos_memo;

		if (!c_to or !c_from)
			return false;
		junction_pos_memo=c_to.GetDirection();
		
		if (c_to.GetDirection()==Junction.DIRECTION_LEFT)
			c_to.SetDirection(Junction.DIRECTION_RIGHT);
		else
			c_to.SetDirection(Junction.DIRECTION_LEFT);  
			
		object_tree2=c_from.BeginTrackSearch(direct);
		nextobject2=object_tree2.SearchNext();
		
		while (1)
		{
			nextobject2=object_tree2.GetMapObject();
			if (!nextobject2)
				break;
			nextnextobject2=object_tree2.SearchNext();
			if ((nextobject2==c_to) and (!nextnextobject2))
			{
				c_to.SetDirection(junction_pos_memo);
				return true;
			}
		}
		c_to.SetDirection(junction_pos_memo);                        
		return false;
	}

	void Branch_search(Trackside Source, bool relative_facing, bool master_rescan, int route_number)
	{
		GSTrackSearch object_tree;
		MapObject nextobject,nextnextobject;
		Junction is_junction;
		Signal is_signal;
		int n,k,nr_tmp,route_buffer;
		bool next_facing,master_facing;
		Asset Next_asset;
		StringTable Next_settings;
		Semnal CFR_Signal;

		if (!Source)
			return;
			
		if (master_rescan)
		{
			relative_facing=true;
			object_tree=me.BeginTrackSearch(true);    
			nextobject=object_tree.SearchNext();
			while (1)
			{       
                nextobject=object_tree.GetMapObject();
                if (!nextobject)
					break;
                next_facing=object_tree.GetFacingRelativeToSearchDirection();
                nextnextobject=object_tree.SearchNext();
                if (nextobject==Source)
				{
                    if (!next_facing)
						relative_facing = !relative_facing;
                    Branch_search(nextobject,relative_facing,false,route_number);
                    break;
                }
			}
			return;
		}
		
		master_facing=relative_facing;
		object_tree=Source.BeginTrackSearch(relative_facing);    
		nextobject=object_tree.SearchNext();
		
		while (1)
		{
			nextobject=object_tree.GetMapObject();
			if (!nextobject)
				break;
			next_facing=object_tree.GetFacingRelativeToSearchDirection();
			nextnextobject=object_tree.SearchNext();
			is_signal=cast<Signal>nextobject;
			is_junction=cast<Junction>nextobject;
			
			if ((is_signal) and (next_facing))
			{
				CFR_Signal=cast<Semnal>is_signal;
				if (CFR_Signal)
				{
					Next_asset=CFR_Signal.GetAsset();
					Next_settings=Next_asset.GetStringTable();    
					if (!Str.ToInt(Next_settings.GetString("SIGNAL_DTV_SHUNT")) and !Str.ToInt(Next_settings.GetString("SIGNAL_TMV_SHUNT")) and !Str.ToInt(Next_settings.GetString("SIGNAL_DTV_REPEATER")) and !Str.ToInt(Next_settings.GetString("SIGNAL_TMV_REPEATER")) and !Str.ToInt(Next_settings.GetString("SIGNAL_DTV_FAULT")) and !Str.ToInt(Next_settings.GetString("SIGNAL_TMV_FAULT")))
						break;
					else if (Str.ToInt(Next_settings.GetString("SIGNAL_DTV_EXITENTRY")) or Str.ToInt(Next_settings.GetString("SIGNAL_TMV_EXITENTRY")))
						break;
                }
				else
					break;
			}
			
			if (is_junction)
			{
				if (!next_facing)
					relative_facing = !relative_facing;
					
				if (rules.size()==0)
				{
					rules[rules.size()]=new JRule();
					if ((rules[rules.size()-1].slow==0) and (is_tmv))
						rules[rules.size()-1].slow=10;
				}
				
				if (!nextnextobject)
				{
					if (is_junction.GetDirection()==Junction.DIRECTION_LEFT)
						is_junction.SetDirection(Junction.DIRECTION_RIGHT);   
					else
						is_junction.SetDirection(Junction.DIRECTION_LEFT);
					n=rules[route_number].njunc.size();
					rules[route_number].njunc[n]=is_junction.GetName();        
					rules[route_number].junc[n]=is_junction;
					rules[route_number].dir[n]=is_junction.GetDirection();
					Branch_search(is_junction,true,true,route_number);  
					break;
				}
				
				if (Check_Junction_Attack_Angle(Source,is_junction,master_facing))
				{
					n=rules[route_number].njunc.size();
					rules[route_number].njunc[n]=is_junction.GetName();
					rules[route_number].junc[n]=is_junction;
					rules[route_number].dir[n]=is_junction.GetDirection();
					Branch_search(is_junction,true,true,route_number);  
					break;
				}
				
				n=rules[route_number].njunc.size();
				rules[route_number].njunc[n]=is_junction.GetName();
				rules[route_number].junc[n]=is_junction;
				is_junction.SetDirection(Junction.DIRECTION_LEFT);
				rules[route_number].dir[n]=0;
				Branch_search(is_junction,true,true,route_number);
				route_buffer=route_number;
				route_number=rules.size();
				rules[route_number]=new JRule();
				
				if ((rules[route_number].slow==0) and (is_tmv))
					rules[route_number].slow=10;    
					
				for (k=0;k<=n;k++)
				{
					nr_tmp=rules[route_number].njunc.size();
					rules[route_number].njunc[nr_tmp]=rules[route_buffer].njunc[k];
					rules[route_number].junc[nr_tmp]=rules[route_buffer].junc[k];
					rules[route_number].dir[nr_tmp]=rules[route_buffer].dir[k];
				}
				
				is_junction.SetDirection(Junction.DIRECTION_RIGHT);
				rules[route_number].dir[n]=2;
				Branch_search(is_junction,true,true,route_number);
				break;
			}
		}
		return;
	}

	void ROUTE_CONFIG_HELPER(void)
	{
		int i;

		for (i=rules.size()-1;i>=0;i--)
		{
			UnsubscribeFrom(rules[i].nextSignal);
			rules[i,i+1]=null;
		}
		Branch_search(me,true,false,0);
	}

	thread void Setup(int mode)
	{
		int i,j;

		if (mode==1)
		{
		
			for (i=0; i<rules.size(); i++)
			{
				UnsubscribeFrom(rules[i].nextSignal);
				rules[i].Setup();
				Lookup_NextSignal(i);
				SubscribeTo(rules[i].nextSignal);
				Sleep(1);
			}
			
			UnsubscribeFrom(nextSignal);
			Lookup_NextSignal(-1);
			SubscribeTo(nextSignal);
			FindRuleIndex(null);
			active_nextSignal=FindSignal();
			if (active_nextSignal)
				active_nextSignalName=active_nextSignal.GetName();
			Update();
		}
		else
		{
			for (i=0; i<rules.size(); i++)
			{
				rules[i].Setup();
				rules[i].nextSignal=cast<Signal>Router.GetGameObject(rules[i].nextSignalName);
				SubscribeTo(rules[i].nextSignal);
				Sleep(1);
			}
			
			nextSignal=cast<Signal>Router.GetGameObject(nextSignalName);
			SubscribeTo(nextSignal);
			FindRuleIndex(null);
			active_nextSignal=FindSignal();
			if (active_nextSignal)
				active_nextSignalName=active_nextSignal.GetName();
			Update();          
		}
	}

	void NOTHREADSetup(int mode)
	{
		int i,j;

		if (mode==1)
		{
			for (i=0; i<rules.size(); i++)
			{
				UnsubscribeFrom(rules[i].nextSignal);
				rules[i].Setup();
				Lookup_NextSignal(i);
				SubscribeTo(rules[i].nextSignal);
			}
			
			UnsubscribeFrom(nextSignal);
			Lookup_NextSignal(-1);
			SubscribeTo(nextSignal);
			FindRuleIndex(null);
			active_nextSignal=FindSignal();
			if (active_nextSignal)
				active_nextSignalName=active_nextSignal.GetName();
			Update();
		}
		else
		{
			for (i=0; i<rules.size(); i++)
			{
				rules[i].Setup();
				rules[i].nextSignal=cast<Signal>Router.GetGameObject(rules[i].nextSignalName);
				SubscribeTo(rules[i].nextSignal);
			}
			
			nextSignal=cast<Signal>Router.GetGameObject(nextSignalName);
			SubscribeTo(nextSignal);
			FindRuleIndex(null);
			active_nextSignal=FindSignal();
			if (active_nextSignal)
				active_nextSignalName=active_nextSignal.GetName();
			Update();          
		}
	}

	//Functia ce creeaza un link in HTML pentru o proprietate
	string MakeProperty(string link, string text)
	{
		string t;
		if (text=="")
			t=T_NONE;
		else 
			t=text;
		return HTMLWindow.MakeLink("live://property/"+link,t);
	}
	
	//Functia ce intoarce regula cu indexul r
	string GetRuleHTML(int r)
	{
		string bgcol=T_BGCOLOR;
		string bgcol2=T_BGCOLOR2;
		string ret=HTMLWindow.StartTable();
		int j;
		
		ret=ret+HTMLWindow.MakeRow(
			HTMLWindow.MakeCell("        ")+
			HTMLWindow.MakeCell(T_JUNCTION,bgcol)+
			HTMLWindow.MakeCell(T_JUNCTION_LEFT,bgcol)+
			HTMLWindow.MakeCell(T_JUNCTION_FORWARD,bgcol)+
			HTMLWindow.MakeCell(T_JUNCTION_RIGHT,bgcol)+
			HTMLWindow.MakeCell(MakeProperty("del-rule/"+r,T_DEL),bgcol2)
		);
		
		for(j=0; j<rules[r].njunc.size(); j++)
		{
			Sleep(10);
			ret=ret+HTMLWindow.MakeRow(
				HTMLWindow.MakeCell("        ")+
				HTMLWindow.MakeCell(MakeProperty("junc/"+r+"/"+j,rules[r].njunc[j]),bgcol2)+
				HTMLWindow.MakeCell(HTMLWindow.RadioButton("live://property/dir/"+r+"/"+j+"/"+Junction.DIRECTION_LEFT,rules[r].dir[j]==Junction.DIRECTION_LEFT),bgcol2)+
				HTMLWindow.MakeCell(HTMLWindow.RadioButton("live://property/dir/"+r+"/"+j+"/"+Junction.DIRECTION_FORWARD,rules[r].dir[j]==Junction.DIRECTION_FORWARD),bgcol2)+
				HTMLWindow.MakeCell(HTMLWindow.RadioButton("live://property/dir/"+r+"/"+j+"/"+Junction.DIRECTION_RIGHT,rules[r].dir[j]==Junction.DIRECTION_RIGHT),bgcol2)+
				HTMLWindow.MakeCell(MakeProperty("del-junc/"+r+"/"+j,T_DEL),bgcol2)
			);
		}
		
		ret=ret+HTMLWindow.MakeRow(
			HTMLWindow.MakeCell("        ")+
			HTMLWindow.MakeCell(MakeProperty("add-junc/"+r,T_JUNCTION_ADD),bgcol2)
		);
		
		ret=ret+HTMLWindow.MakeRow(
			HTMLWindow.MakeCell("        ")+
			HTMLWindow.MakeCell("Semnal urmator in abatere: "+rules[r].nextSignalName,bgcol)
		);
		
		ret=ret+HTMLWindow.MakeRow(
			HTMLWindow.MakeCell("        ")+
			HTMLWindow.MakeCell(MakeProperty("rule-slow/"+r,"<font color=#0525FF>"+T_RESTRICTIA[rules[r].slow]+"</font>"),bgcol2)
		);
		
		if (Str.ToInt(ST.GetString("HAS_DIRECTION_MARKER")))
		{
			ret=ret+HTMLWindow.MakeRow(
				HTMLWindow.MakeCell("        ")+
				HTMLWindow.MakeCell(MakeProperty("rule-direction/"+r,"<font color=#0525FF>"+T_DIRECTIA[rules[r].direction_marker]+"</font>"),bgcol2)
			);
		}
		
		//CheckBox pentru iesire pe linia din stanga a caii duble
		if (!is_mec) //nu exista la cele mecanice
			ret=ret+HTMLWindow.MakeRow(
				HTMLWindow.MakeCell("        ")+
				HTMLWindow.MakeCell(T_IESIRE_ST+HTMLWindow.CheckBox("live://property/exit-left/"+r,rules[r].exit_left),bgcol2)
			);
		
		ret=ret+HTMLWindow.EndTable();
		return ret;
	}

	//Functia de afisare a paginii de configurare
	public string GetDescriptionHTML(void)
	{
		string ret="<html><body>"+T_TITLE+"<br>";
		string bgcol=T_BGCOLOR;
		string bgcol2=T_BGCOLOR2;
		int dist; //distanta pana la urmatorul semnal/macaz
  
		//INTRARE sau IESIRE DTV 2 SAU MECANIC 1i
		if ((Str.ToInt(ST.GetString("SIGNAL_DTV_EXITENTRY")) and (Str.ToInt(ST.GetString("LIGHTS_COUNT"))==2)) or (Str.ToInt(ST.GetString("SIGNAL_MEC_EXITENTRY")) and (Str.ToInt(ST.GetString("LIGHTS_COUNT"))==1)))
		{
			ret=ret+HTMLWindow.StartTable();
			ret=ret+HTMLWindow.MakeRow(
				HTMLWindow.MakeCell("Numele Afisat: ",bgcol)+
				HTMLWindow.MakeCell(MakeProperty("name",thisSignalDisplayName),bgcol2)
			);
			ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell(MakeProperty("one-signal-link","<font color=#A826B3>"+"Leaga Semnalul curent in Schema de semnalizare"+"</font>"),bgcol2));
			ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell(MakeProperty("signal-link","<font color=#A826B3>"+"Reconstituire totala Schema de semnalizare"+"</font>"),bgcol2));
			ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell("Semnal urmator direct: "+nextSignalName,bgcol));
			ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell(MakeProperty("signal-instruction","<font color=#303030>"+T_INSTRUCTIA[use_instruction]+"</font>"),bgcol2));  
			
			if (Str.ToInt(ST.GetString("IS_ENTRY")))
				ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell("Semnalul este de INTRARE",bgcol));
			else
				ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell("Semnalul este de IESIRE",bgcol));
	   
			//Afiseaza caseta de scos din uz
			ret=ret+HTMLWindow.MakeRow(
				HTMLWindow.MakeCell(T_XXX+HTMLWindow.CheckBox("live://property/xxx",xxx),bgcol2)
			);
	   
			//Afisare distanta pana la urmatorul macaz
			dist = DistantaMacaz();
			if (dist == 0)
				ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell("<font color='#DD0000'>Macazul urmator este prea departe sau nu exista!</font>",bgcol));
			else if (dist >= 300)
				ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell("<font color='#DD0000'>Macazul urmator este la " + dist + "m distanta.</font>",bgcol));
			else if ((dist >= 250) and (dist < 300))
				ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell("<font color='#DDDD00'>Macazul urmator este la " + dist + "m distanta.</font>",bgcol));
			else if ((dist > 150) and (dist < 250))
				ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell("<font color='#008800'>Macazul urmator este la " + dist + "m distanta.</font>",bgcol));
			else if ((dist > 100) and (dist <= 150))
				ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell("<font color='#DDDD00'>Macazul urmator este la " + dist + "m distanta.</font>",bgcol));
			else if (dist <= 100)
				ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell("<font color='#DD0000'>Macazul urmator este la " + dist + "m distanta.</font>",bgcol));
			
			ret=ret+HTMLWindow.EndTable();    
			ret=ret+"</body></html>";
			return ret;
		
		}
		
		//INTRARE sau IESIRE
		if (Str.ToInt(ST.GetString("SIGNAL_DTV_EXITENTRY")) or Str.ToInt(ST.GetString("SIGNAL_TMV_EXITENTRY")) or Str.ToInt(ST.GetString("SIGNAL_MEC_EXITENTRY")))
		{
			ret=ret+HTMLWindow.StartTable();
			ret=ret+HTMLWindow.MakeRow(
				HTMLWindow.MakeCell("Numele Afisat: ",bgcol)+
				HTMLWindow.MakeCell(MakeProperty("name",thisSignalDisplayName),bgcol2)
			);
			ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell(MakeProperty("one-signal-link","<font color=#A826B3>"+"Leaga Semnalul curent in Schema de semnalizare"+"</font>"),bgcol2));
			ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell(MakeProperty("signal-link","<font color=#A826B3>"+"Reconstituire totala Schema de semnalizare"+"</font>"),bgcol2));
			ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell(MakeProperty("config-help","<font color=#A826B3>"+"Gaseste toate macazurile"+"</font>"),bgcol2));
			ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell("Semnal urmator direct: "+nextSignalName,bgcol));
			ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell(MakeProperty("signal-instruction","<font color=#303030>"+T_INSTRUCTIA[use_instruction]+"</font>"),bgcol2));
			ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell("Semnalul este de INTRARE/IESIRE/RAMIFICATIE",bgcol));
			
			//Afiseaza daca are si MANEVRA sau nu
			if (Str.ToInt(ST.GetString("SIGNAL_DTV_SHUNT")) or Str.ToInt(ST.GetString("SIGNAL_TMV_SHUNT")))
				ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell("Semnalul da indicatie de MANEVRA",bgcol));
			else
				ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell("Semnalul nu da indicatie de MANEVRA",bgcol));

			//Afiseaza caseta de scos din uz
			ret=ret+HTMLWindow.MakeRow(
				HTMLWindow.MakeCell(T_XXX+HTMLWindow.CheckBox("live://property/xxx",xxx),bgcol2)
			);
			
			//Afisare distanta pana la urmatorul macaz
			dist = DistantaMacaz();
			if (dist == 0)
				ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell("<font color='#DD0000'>Macazul urmator este prea departe sau nu exista!</font>",bgcol));
			else if (dist >= 300)
				ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell("<font color='#DD0000'>Macazul urmator este la " + dist + "m distanta.</font>",bgcol));
			else if ((dist >= 250) and (dist < 300))
				ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell("<font color='#DDDD00'>Macazul urmator este la " + dist + "m distanta.</font>",bgcol));
			else if ((dist > 150) and (dist < 250))
				ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell("<font color='#008800'>Macazul urmator este la " + dist + "m distanta.</font>",bgcol));
			else if ((dist > 100) and (dist <= 150))
				ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell("<font color='#DDDD00'>Macazul urmator este la " + dist + "m distanta.</font>",bgcol));
			else if (dist <= 100)
				ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell("<font color='#DD0000'>Macazul urmator este la " + dist + "m distanta.</font>",bgcol));
		
			//Afisare configuratie macaze
			if (rules.size()==0)
			{
				ret=ret+HTMLWindow.MakeRow(
					HTMLWindow.MakeCell(T_RULES_NONE,bgcol)+
					HTMLWindow.MakeCell(MakeProperty("add-rule",T_RULES_ADD),bgcol2)
				);
			}
			else
			{
				int r;
				for(r=0; r<rules.size(); r++)
				{
					Sleep(10);
					ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell(GetRuleHTML(r)));
				}
				ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell(MakeProperty("add-rule",T_RULES_ADD),bgcol2));
            }
			
			ret=ret+HTMLWindow.EndTable();    
			ret=ret+"</body></html>";
			
			return ret;
		}
		
		//MANEVRA
		if (!(Str.ToInt(ST.GetString("SIGNAL_DTV_EXITENTRY")) or Str.ToInt(ST.GetString("SIGNAL_TMV_EXITENTRY"))) and (Str.ToInt(ST.GetString("SIGNAL_DTV_SHUNT")) or Str.ToInt(ST.GetString("SIGNAL_TMV_SHUNT")) or Str.ToInt(ST.GetString("SIGNAL_MEC_SHUNT"))))
		{
			ret=ret+HTMLWindow.StartTable();
			ret=ret+HTMLWindow.MakeRow(
				HTMLWindow.MakeCell("Numele Afisat: ",bgcol)+
				HTMLWindow.MakeCell(MakeProperty("name",thisSignalDisplayName),bgcol2)
			);
			ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell(MakeProperty("one-signal-link","<font color=#A826B3>"+"Leaga Semnalul curent in Schema de semnalizare"+"</font>"),bgcol2));
			ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell(MakeProperty("signal-link","<font color=#A826B3>"+"Reconstituire totala Schema de semnalizare"+"</font>"),bgcol2));
			ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell("Semnalul urmator: "+nextSignalName,bgcol));
			ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell(MakeProperty("signal-instruction","<font color=#303030>"+T_INSTRUCTIA[use_instruction]+"</font>"),bgcol2));  
			ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell("Semnalul este de MANEVRA",bgcol));
			
			//Afiseaza caseta de scos din uz
			ret=ret+HTMLWindow.MakeRow(
				HTMLWindow.MakeCell(T_XXX+HTMLWindow.CheckBox("live://property/xxx",xxx),bgcol2)
			);
			
			ret=ret+HTMLWindow.EndTable();    
			ret=ret+"</body></html>";
			return ret;
		}
		
		//AVARIE
		if (!(Str.ToInt(ST.GetString("SIGNAL_DTV_LINE_BLOCK")) or Str.ToInt(ST.GetString("SIGNAL_TMV_LINE_BLOCK"))) and (Str.ToInt(ST.GetString("SIGNAL_DTV_FAULT")) or Str.ToInt(ST.GetString("SIGNAL_TMV_FAULT"))))
		{
			ret=ret+HTMLWindow.StartTable();
			ret=ret+HTMLWindow.MakeRow(
				HTMLWindow.MakeCell("Numele Afisat: ",bgcol)+
				HTMLWindow.MakeCell(MakeProperty("name",thisSignalDisplayName),bgcol2)
			);
			ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell(MakeProperty("one-signal-link","<font color=#A826B3>"+"Leaga Semnalul curent in Schema de semnalizare"+"</font>"),bgcol2));
			ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell(MakeProperty("signal-link","<font color=#A826B3>"+"Reconstituire totala Schema de semnalizare"+"</font>"),bgcol2));
			ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell("Semnalul urmator: "+nextSignalName,bgcol));
			ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell(MakeProperty("signal-instruction","<font color=#303030>"+T_INSTRUCTIA[use_instruction]+"</font>"),bgcol2));  
			ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell("Semnalul este de AVARIE",bgcol));
			
			//Afiseaza caseta de scos din uz
			ret=ret+HTMLWindow.MakeRow(
				HTMLWindow.MakeCell(T_XXX+HTMLWindow.CheckBox("live://property/xxx",xxx),bgcol2)
			);
			
			ret=ret+HTMLWindow.EndTable();    
			ret=ret+"</body></html>";
			return ret;
		}
		
		//BLA
		if (Str.ToInt(ST.GetString("SIGNAL_DTV_LINE_BLOCK")) or Str.ToInt(ST.GetString("SIGNAL_TMV_LINE_BLOCK")))
		{
			ret=ret+HTMLWindow.StartTable();
			ret=ret+HTMLWindow.MakeRow(
				HTMLWindow.MakeCell("Numele Afisat: ",bgcol)+
				HTMLWindow.MakeCell(MakeProperty("name",thisSignalDisplayName),bgcol2)
			);
			ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell(MakeProperty("one-signal-link","<font color=#A826B3>"+"Leaga Semnalul curent in Schema de semnalizare"+"</font>"),bgcol2));
			ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell(MakeProperty("signal-link","<font color=#A826B3>"+"Reconstituire totala Schema de semnalizare"+"</font>"),bgcol2));
			ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell("Semnal urmator direct: "+nextSignalName,bgcol));
			ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell(MakeProperty("signal-instruction","<font color=#303030>"+T_INSTRUCTIA[use_instruction]+"</font>"),bgcol2));  
			ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell("Semnalul este BLOC DE LINIE AUTOMAT",bgcol));
	   
			//Afiseaza daca are si AVARIE sau nu
			if (Str.ToInt(ST.GetString("SIGNAL_DTV_FAULT")) or Str.ToInt(ST.GetString("SIGNAL_TMV_FAULT")))
				ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell("Semnalul da indicatie de AVARIE",bgcol));
			else
				ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell("Semnalul nu da indicatie de AVARIE",bgcol));
	   
			//Afiseaza caseta de scos din uz
			ret=ret+HTMLWindow.MakeRow(
				HTMLWindow.MakeCell(T_XXX+HTMLWindow.CheckBox("live://property/xxx",xxx),bgcol2)
			);
	   
			//Afisare distanta pana la urmatorul semnal
			dist = DistantaSemnal();
			if (dist == 0)
				ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell("<font color='#DD0000'>Semnalul urmator este prea departe sau nu exista!</font>",bgcol));
			else if (dist >= 1500)
				ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell("<font color='#DD0000'>Semnalul urmator este la " + dist + "m distanta.</font>",bgcol));
			else if ((dist >= 1300) and (dist < 1500))
				ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell("<font color='#DDDD00'>Semnalul urmator este la " + dist + "m distanta.</font>",bgcol));
			else if ((dist > 1100) and (dist < 1300))
				ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell("<font color='#008800'>Semnalul urmator este la " + dist + "m distanta.</font>",bgcol));
			else if ((dist > 800) and (dist <= 1100))
				ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell("<font color='#DDDD00'>Semnalul urmator este la " + dist + "m distanta.</font>",bgcol));
			else if (dist <= 800)
				ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell("<font color='#DD0000'>Semnalul urmator este la " + dist + "m distanta.</font>",bgcol));
			
			ret=ret+HTMLWindow.EndTable();    
			ret=ret+"</body></html>";
			return ret;
		}
 
		//PREVESTITOR
		if (Str.ToInt(ST.GetString("SIGNAL_DTV_DISTANT")) or Str.ToInt(ST.GetString("SIGNAL_TMV_DISTANT")) or Str.ToInt(ST.GetString("SIGNAL_MEC_DISTANT")))
		{
			ret=ret+HTMLWindow.StartTable();
			ret=ret+HTMLWindow.MakeRow(
				HTMLWindow.MakeCell("Numele Afisat: ",bgcol)+
				HTMLWindow.MakeCell(MakeProperty("name",thisSignalDisplayName),bgcol2)
			);
			ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell(MakeProperty("one-signal-link","<font color=#A826B3>"+"Leaga Semnalul curent in Schema de semnalizare"+"</font>"),bgcol2));
			ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell(MakeProperty("signal-link","<font color=#A826B3>"+"Reconstituire totala Schema de semnalizare"+"</font>"),bgcol2));
			ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell("Semnal urmator direct: "+nextSignalName,bgcol));
			ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell(MakeProperty("signal-instruction","<font color=#303030>"+T_INSTRUCTIA[use_instruction]+"</font>"),bgcol2));  
			ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell("Semnalul este PREVESTITOR",bgcol));

			//Afiseaza caseta de scos din uz
			ret=ret+HTMLWindow.MakeRow(
				HTMLWindow.MakeCell(T_XXX+HTMLWindow.CheckBox("live://property/xxx",xxx),bgcol2)
			);
			
			//Afisare distanta pana la urmatorul semnal
			dist = DistantaSemnal();
			if (dist == 0)
				ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell("<font color='#DD0000'>Semnalul urmator este prea departe sau nu exista!</font>",bgcol));
			else if (dist >= 1300)
				ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell("<font color='#DD0000'>Semnalul urmator este la " + dist + "m distanta.</font>",bgcol));
			else if ((dist >= 1100) and (dist < 1300))
				ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell("<font color='#DDDD00'>Semnalul urmator este la " + dist + "m distanta.</font>",bgcol));
			else if ((dist > 900) and (dist < 1100))
				ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell("<font color='#008800'>Semnalul urmator este la " + dist + "m distanta.</font>",bgcol));
			else if ((dist > 600) and (dist <= 900))
				ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell("<font color='#DDDD00'>Semnalul urmator este la " + dist + "m distanta.</font>",bgcol));
			else if (dist <= 600)
				ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell("<font color='#DD0000'>Semnalul urmator este la " + dist + "m distanta.</font>",bgcol));
			
			ret=ret+HTMLWindow.EndTable();    
			ret=ret+"</body></html>";
			return ret;
		}
		
		//REPETITOR
		if (Str.ToInt(ST.GetString("SIGNAL_DTV_REPEATER")) or Str.ToInt(ST.GetString("SIGNAL_TMV_REPEATER")) or Str.ToInt(ST.GetString("SIGNAL_MEC_REPEATER")))
		{
			ret=ret+HTMLWindow.StartTable();
			ret=ret+HTMLWindow.MakeRow(
				HTMLWindow.MakeCell("Numele Afisat: ",bgcol)+
				HTMLWindow.MakeCell(MakeProperty("name",thisSignalDisplayName),bgcol2)
			);
			ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell(MakeProperty("one-signal-link","<font color=#A826B3>"+"Leaga Semnalul curent in Schema de semnalizare"+"</font>"),bgcol2));
			ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell(MakeProperty("signal-link","<font color=#A826B3>"+"Reconstituire totala Schema de semnalizare"+"</font>"),bgcol2));
			ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell("Semnalul repeta indicatia semnalului: "+nextSignalName,bgcol));
			ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell(MakeProperty("signal-instruction","<font color=#303030>"+T_INSTRUCTIA[use_instruction]+"</font>"),bgcol2));  
			ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell("Semnalul este REPETITOR",bgcol));
			
			//Afiseaza caseta de scos din uz
			ret=ret+HTMLWindow.MakeRow(
				HTMLWindow.MakeCell(T_XXX+HTMLWindow.CheckBox("live://property/xxx",xxx),bgcol2)
			);
			
			ret=ret+HTMLWindow.EndTable();    
			ret=ret+"</body></html>";
			return ret;
		}
		
		return ret;
	}

	public string GetPropertyType(string id)
	{
		string[] tok=Str.Tokens(id,"/");
		
		if (tok[0]=="rule-direction")
			return "list";
		else if (tok[0]=="rule-slow")
			return "list";
		else if (tok[0]=="junc")
			return "list,1";
		else if (tok[0]=="signal-instruction")
			return "list,1";
		else if (tok[0]=="name")
			return "string,0,8";
			
		return "link";
	}

	//Functia ce returneaza ferestrele cu liste de selectie pentru HTML
	public string[] GetPropertyElementList(string id)
	{
		string[] tok=Str.Tokens(id,"/");
		string[] list=new string[0];

		//Daca am dat clic pe Adauga Macaz, afiseaza lista tuturor macazurilor
		if (tok[0]=="junc")
		{
			Junction[] jlist=World.GetJunctionList();
			string[] list=new string[0];
			int i;
			for (i=0; i<jlist.size(); i++)
				list[i]=jlist[i].GetName();
			return list;
		}
		
		//Daca am dat clic pe Directia indicata la semnal, afiseaza lista tuturor literelor
		if (tok[0]=="rule-direction")
		{
			int i;
			for(i=0;i<T_DIRECTIA.size();i++)
				list[list.size()]=T_DIRECTIA[i]; //citeste-le din config
			return list;
		}
		
		//Daca am dat clic pe Viteza indicata la semnal, afiseaza lista tuturor vitezelor
		if (tok[0]=="rule-slow")
		{
			int i;
			int l,p;
			
			//Daca este MEC, avem 2 viteze posibile
			if (is_mec)
			{
				l=0;
				p=1;
			}
			
			//Daca este DTV, avem 4 viteze posibile
			if (is_dtv)
			{
				l=0;
				if (Str.ToInt(ST.GetString("HAS_BAR")))
					p=3;
				else
					p=1;
			}
			
			//Daca este TMV, avem 7 viteze posibile
			if (is_tmv)
			{
				l=4;
				p=10;
			}
			
			for(i=l;i<=p;i++)
				list[list.size()]=T_RESTRICTIA[i]; //citeste-le din config
				
			//Regulile de manevra si chemare
			if (!is_mec) //nu exista la cele mecanice
			{
				list[list.size()]=T_RESTRICTIA[91];
				list[list.size()]=T_RESTRICTIA[92];	
			}
			
			return list;
		}

		//Daca am dat clic pe Set Instructiuni semnal, afiseaza lista tuturor modurilor de functionare
		if (tok[0]=="signal-instruction")
		{
			int i;
			int l,p;
			
			//Daca este DTV, avem doar 1 posibilitate
			if (is_dtv)
			{
				l=1;
				p=1;
			}
			
			//Daca este MEC, avem doar 1 posibilitate
			if (is_mec)
			{
				l=2;
				p=2;
			}
			
			//Daca este TMV, avem doar 1 posibilitate
			if (is_tmv)
			{
				l=3;
				p=3;
			}
			
			for(i=l;i<=p;i++)
				list[list.size()]=T_INSTRUCTIA[i]; //citeste-le din config
				
			return list;
		}

		return list;
	}

	//Functia ce actualizeaza proprietatile si variabilele dupa selectarea optiunii in HTML
	public void SetPropertyValue(string id, string val)
	{
		string[] tok=Str.Tokens(id,"/");
  
		//Daca s-a modificat directia, memoreaza noua directie
		if (tok[0]=="rule-direction") 
		{
			int r=Str.ToInt(tok[1]);
			int i;   
			for(i=0;i<T_DIRECTIA.size();i++)
				if (val==T_DIRECTIA[i])
					rules[r].direction_marker = i;
			Update();
		}
		
		//Daca s-a modificat restrictia de viteza, memoreaza noua restrictie
		if (tok[0]=="rule-slow")
		{
			int r=Str.ToInt(tok[1]);
			int i;
			int l,p;
			
			//Daca este MEC, avem 2 viteze posibile
			if (is_mec)
			{
				l=0;
				p=1;
			}
			
			//Daca este DTV, avem 4 viteze posibile
			if (is_dtv)
			{
				l=0;
				if (Str.ToInt(ST.GetString("HAS_BAR")))
					p=3;
				else
					p=1;
			}
			
			//Daca este TMV, avem 7 viteze posibile
			if (is_tmv)
			{
				l=4;
				p=10;
			}
			
			for(i=l;i<=p;i++)
				if (val==T_RESTRICTIA[i])
					rules[r].slow = i;
					
			//Regulile de manevra si chemare
			if (!is_mec) //nu exista la cele mecanice
			{
				if (val==T_RESTRICTIA[91])
						rules[r].slow = 91;
				if (val==T_RESTRICTIA[92])
						rules[r].slow = 92;
			}
			
			Update();
		}
		
		//Daca s-a modificat setul de instructiuni, memoreaza noul set
		if (tok[0]=="signal-instruction")
		{
			int i;
			int l,p;
			
			//Daca este DTV, avem doar 1 posibilitate
			if (is_dtv)
			{
				l=1;
				p=1;
			}
			
			//Daca este MEC, avem doar 1 posibilitate
			if (is_mec)
			{
				l=2;
				p=2;
			}
			
			//Daca este TMV, avem doar 1 posibilitate
			if (is_tmv)
			{
				l=3;
				p=3;
			}
			
			for(i=l;i<=p;i++)
				if (val == T_INSTRUCTIA[i])
					use_instruction = i;

			Update();
		}
		
		//Daca s-a modificat macazul
		if (tok[0]=="junc")
		{
			int r=Str.ToInt(tok[1]);
			int j=Str.ToInt(tok[2]);
			rules[r].njunc[j]=val;
			rules[r].junc[j]=cast<Junction>Router.GetGameObject(val);
			UnsubscribeFrom(rules[r].nextSignal);
			Update();
		}
		
		//Daca s-a modificat numele afisat, afiseaza noul nume
		if (tok[0]=="name")
		{
			thisSignalDisplayName = val;
			SetFXNameText("name0"," ");
			SetFXNameText("name1"," ");
			if (thisSignalDisplayName!="")
			{ 
				//Daca semnalul e pitic, nu imparti textul in doua randuri
				if (Str.ToInt(ST.GetString("PITIC")))
					SetFXNameText("name0",thisSignalDisplayName);
				else
				//Daca nu e pitic, imparte textul in doua randuri
				{
					string[] tok=Str.Tokens(thisSignalDisplayName," ");
					SetFXNameText("name0",tok[0]);
					if (tok.size()>=2) //Daca exista cel putin doua cuvinte
						SetFXNameText("name1",tok[1]);
				}
			}
		}
		
		//Daca s-a modificat CheckBox-ul pentru iesire pe linia din stanga
		if (tok[0]=="exit-left")
		{
			int r=Str.ToInt(tok[1]);
			rules[r].exit_left=Str.ToInt(tok[2]);
		}
		
		//Daca s-a modificat CheckBox-ul pentru semnal scos din uz.
		if (tok[0]=="xxx")
		{
			xxx=Str.ToInt(tok[1]);
		}
	}

	public void SetPropertyValue(string id, string val, int idx)
	{
		SetPropertyValue(id,val);
	}

	//Functia ce trateaza clicul pe un link din HTML
	public void LinkPropertyValue(string id)
	{
		int k;
		Signal [] SignalList = new Signal[0];
		Semnal ASLink;
		string[] tok=Str.Tokens(id,"/");
	
		//Daca am dat clic pe Adauga Configuratie
		if (tok[0]=="add-rule")
		{
			rules[rules.size()]=new JRule();
			if ((rules[rules.size()-1].slow==0) and (is_tmv))
				rules[rules.size()-1].slow=10;
		}
		
		//Daca am dat clic pe Adauga Macaz
		if (tok[0]=="add-junc")
		{
			int r=Str.ToInt(tok[1]);
			int n=rules[r].njunc.size();
			rules[r].njunc[n]="";
			rules[r].junc[n]=null;
			rules[r].dir[n]=Junction.DIRECTION_NONE;
		}
		
		//Daca am dat clic pe Sterge Configuratie
		if (tok[0]=="del-rule")
		{
			int r=Str.ToInt(tok[1]);
			rules[r,r+1]=null;
		}
		
		//Daca am dat clic pe Sterge Macaz
		if (tok[0]=="del-junc")
		{
			int r=Str.ToInt(tok[1]);
			int j=Str.ToInt(tok[2]);
			rules[r].junc[j,j+1]=null;
			rules[r].njunc[j,j+1]=null;
			rules[r].dir[j,j+1]=null;
			UnsubscribeFrom(rules[r].nextSignal);
		}
		
		//Daca am schimbat directia macazului
		if (tok[0]=="dir")
		{
			int r=Str.ToInt(tok[1]);
			int j=Str.ToInt(tok[2]);
			int d=Str.ToInt(tok[3]);
			rules[r].dir[j]=d;
			UnsubscribeFrom(rules[r].nextSignal);
		}
		
		//Daca am dat clic pe Leaga semnal in schema de semnalizare
		if (tok[0]=="one-signal-link")
		{
			NOTHREADSetup(1);
		}
		
		//Daca am dat clic pe Reconstituie toata schema de semnalizare
		if (tok[0]=="signal-link")
		{
			SignalList=World.GetSignalList();
			for(k=SignalList.size()-1;k>=0;k--)
			{
				ASLink=cast<Semnal>SignalList[k];
				if (ASLink)
					ASLink.Setup(1);
				SignalList[k,k+1]=null;
			}
			NOTHREADSetup(1);
		}
		
		//Daca am dat clic pe Gaseste toate macazurile
		if (tok[0]=="config-help")
		{
			ROUTE_CONFIG_HELPER();
		}
		
		//Daca am modificat CheckBox-ul pentru iesire pe linia din stanga
		if (tok[0]=="exit-left")
		{
			int r=Str.ToInt(tok[1]);
			rules[r].exit_left=!rules[r].exit_left;
		}
		
		//Daca am modificat CheckBox-ul pentru semnal scos din uz
		if (tok[0]=="xxx")
		{
			xxx=!xxx;
		}
	}

	public string GetPropertyName(string id)
	{
		string[] tok=Str.Tokens(id,"/");

		if (tok[0]=="rule-direction")
			return T_SELECT_DIR;
		else if (tok[0]=="junc")
			return T_JUNCTION;
		else if (tok[0]=="name")
			return T_SELECT_NAME;
		else if (tok[0]=="rule-slow")
			return T_SELECT_RESTRICT;
		else if (tok[0]=="signal-instruction")
			return T_SELECT_INSTRUCT;  
			
		return "";
	}

	public string GetPropertyDescription(string id)
	{
		return "";
	}

	public Soup GetProperties(void)
	{
		Soup sig=inherited();
		sig.SetNamedTag("NextSignalName",nextSignalName);
		sig.SetNamedTag("DisplayedName",thisSignalDisplayName);
		sig.SetNamedTag("xxx",xxx);
		sig.SetNamedTag("Instruction",use_instruction);
		sig.SetNamedTag("rules.num",rules.size());
		int i;
		for (i=0; i<rules.size(); i++)
			sig.SetNamedSoup("rule."+i,rules[i].GetProperties());
		return sig;
	}
	
	public void SetProperties(Soup sig)
	{
		int default_instr;

		nextSignalName=sig.GetNamedTag("NextSignalName");
		thisSignalDisplayName=sig.GetNamedTag("DisplayedName");
		xxx=sig.GetNamedTagAsInt("xxx");
		
		if (is_dtv)
		{
			default_instr=1;
		}
		
		if (is_mec)
		{
			default_instr=2;
		}
		
		if (is_tmv)
		{
			default_instr=3;
		}
		
		use_instruction=sig.GetNamedTagAsInt("Instruction",default_instr);
		int n=sig.GetNamedTagAsInt("rules.num");
		rules=new JRule[n];
		int i;
		for (i=0; i<n; i++)
		{
			rules[i]=new JRule();
			rules[i].SetProperties(sig.GetNamedSoup("rule."+i));
			if (rules[i].slow==0 and is_tmv)
				rules[i].slow=10;
		}
		
		Setup(2);
		SetFXNameText("name0"," ");
		SetFXNameText("name1"," ");
		if (thisSignalDisplayName!="")
		{ 
			if (Str.ToInt(ST.GetString("PITIC")))	//daca e pitic, nu imparti textul in doua
				SetFXNameText("name0",thisSignalDisplayName);
			else	//daca nu e pitic, imparte textul pe doua randuri
			{
				string[] tok=Str.Tokens(thisSignalDisplayName," ");
				SetFXNameText("name0",tok[0]);
				if (tok.size()>=2) //daca exista doua cuvinte
					SetFXNameText("name1",tok[1]);
			}
		}
	}

	//Functia ce este apelata la crearea obiectului
	public void Init(void)
	{
		inherited();
		Asset self=GetAsset();
		ST=self.GetStringTable();
		//Incarca becurile din kuid-table
		rosu=self.FindAsset("Red");
		galben=self.FindAsset("Yellow");
		verde=self.FindAsset("Green");
		alb=self.FindAsset("White");
		albastru=self.FindAsset("Blue");
		albmic=self.FindAsset("Whitesmall");
		galbenmic=self.FindAsset("Yellowsmall");
		verdemic=self.FindAsset("Greensmall");
		verdeclipitor=self.FindAsset("Greenblink");
		galbenclipitor=self.FindAsset("Yellowblink");
		rosuclipitor=self.FindAsset("Redblink");
		albclipitor=self.FindAsset("Whiteblink");
		alblinie=self.FindAsset("Whiteline");
		galbenclipitor2=self.FindAsset("Yellowblink2");

		if (verde==null or galben==null or rosu==null or alb==null or albastru==null or albmic==null or verdemic==null or galbenmic==null or galbenclipitor==null or verdeclipitor==null or rosuclipitor==null or albclipitor==null or alblinie==null or galbenclipitor2==null)
		{
			Interface.Log("Eroare semnale RO-CFR! Nu s-au gasit toate becurile!");
			return;
		}

		if (Str.ToInt(ST.GetString("SIGNAL_MEC_EXITENTRY")) or Str.ToInt(ST.GetString("SIGNAL_MEC_REPEATER")) or Str.ToInt(ST.GetString("SIGNAL_MEC_DISTANT")) or Str.ToInt(ST.GetString("SIGNAL_MEC_SHUNT")))
		{
			is_mec=1;
			is_dtv=0;
			is_tmv=0;
		}
		
		
		//Daca e semnal DTV
		if (Str.ToInt(ST.GetString("SIGNAL_DTV_EXITENTRY")) or Str.ToInt(ST.GetString("SIGNAL_DTV_LINE_BLOCK")) or Str.ToInt(ST.GetString("SIGNAL_DTV_DISTANT")) or Str.ToInt(ST.GetString("SIGNAL_DTV_SHUNT")) or Str.ToInt(ST.GetString("SIGNAL_DTV_REPEATER")) or Str.ToInt(ST.GetString("SIGNAL_DTV_FAULT")))
		{
			is_mec=0;
			is_dtv=1;
			is_tmv=0;
		}
		
		//Daca e semnal TMV
		if (Str.ToInt(ST.GetString("SIGNAL_TMV_EXITENTRY")) or Str.ToInt(ST.GetString("SIGNAL_TMV_LINE_BLOCK")) or Str.ToInt(ST.GetString("SIGNAL_TMV_DISTANT")) or Str.ToInt(ST.GetString("SIGNAL_TMV_SHUNT")) or Str.ToInt(ST.GetString("SIGNAL_TMV_REPEATER")) or Str.ToInt(ST.GetString("SIGNAL_TMV_FAULT")))
		{
			is_mec=0;
			is_dtv=0;
			is_tmv=1;
			
			//La TMV, HAS_BAR inseamna daca are indicatoare de viteza sau nu
			if (Str.ToInt(ST.GetString("HAS_BAR"))==1) 
			{
				TMV_this_limit(0);
			}
			if (Str.ToInt(ST.GetString("HAS_BAR"))==2) 
			{
				TMV_next_limit(0);
			}
			if (Str.ToInt(ST.GetString("HAS_BAR"))==3) 
			{
				TMV_this_limit(0);
				TMV_next_limit(0);
			}
		}
		
		Lights_Off();
		//Daca are indicator de directie
		if (Str.ToInt(ST.GetString("HAS_DIRECTION_MARKER")))
		{
			direction=0;
			Lightup_Direction_Marker();
		}
		
		next_aspect = 2; //Pentru a indica verde la initializare, oricum se face Update(); care actualizeaza aspectele.
		
		//Populeaza "constantele" cu ce trebuie afisat in HTML (vezi delaratiile de la inceputul clasei)
		IncarcaStringurile();
		
		//Adauga Handlere pentru functionalitati
		AddHandler(me,"SchimbareAspect","","Notify");	//Apelata cand s-a schimbat semnalul legat de acesta
		AddHandler(me,"TransmiteStare","","Transmit_State");
		AddHandler(me,"ActivManevra","","ShuntEnable");		//Activeaza manevra
		AddHandler(me,"DezactivManevra","","ShuntDisable");	//Interzice manevra
		AddHandler(me,"ActivAvarie","","FaultEnable");		//Activeaza avarie
		AddHandler(me,"DezactivAvarie","","FaultDisable");	//Opreste avarie
		AddHandler(me,"ActivChemare","","CallEnable");		//Activeaza chemare
		AddHandler(me,"DezactivChemare","","CallDisable");	//Opreste chemare
		AddHandler(me,"Signal","StateChanged","SignalChange");	//S-a schimbat aspectul semnalului
		AddHandler(me,"Junction","Toggled","JunctionChange");	//S-a schimbat orientarea unui macaz
		AddHandler(me,"Semnal","Subscribe","Subscribe");
		AddHandler(me,"Semnal","UnSubscribe","UnSubscribe");
	}

};
