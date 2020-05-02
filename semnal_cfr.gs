include "ScenarioBehavior.gs"
include "common.gs"
include "Signal.gs"
include "Junction.gs"
include "gs.gs"
include "Soup.gs"

class JRule {

 public Junction[] junc=new Junction[0];
 public string[] njunc=new string[0];
 public int[] dir=new int[0];
 public int direction_marker=0;
 public int slow=0;
 public Signal nextSignal;
 public string nextSignalName;
 public int nextSignalID;

 public Soup GetProperties(void) {
  Soup sig=Constructors.NewSoup();
  sig.SetNamedTag("NextSignalName",nextSignalName);
  sig.SetNamedTag("num.j",junc.size());
  if (junc.size()) {
   sig.SetNamedTag("DirectionMarker",direction_marker);
   sig.SetNamedTag("ReduceSpeed",slow);
   int i;
   for (i=0; i<junc.size(); i++) {
    sig.SetNamedTag("junc."+i,njunc[i]);
    sig.SetNamedTag("dir."+i,dir[i]);
   }
  }
  return sig;
 }

 public void SetProperties(Soup sig) {
  nextSignalName=sig.GetNamedTag("NextSignalName");
  int n=sig.GetNamedTagAsInt("num.j",0);
  junc=new Junction[n];
  njunc=new string[n];
  dir=new int[n];
  if (n) {
   direction_marker=sig.GetNamedTagAsInt("DirectionMarker",0);
   slow=sig.GetNamedTagAsInt("ReduceSpeed",0);
   int i;
   for (i=0;i<n;i++) {
    njunc[i]=sig.GetNamedTag("junc."+i);
    dir[i]=sig.GetNamedTagAsInt("dir."+i,3);
   }
  }
 }

 public void Setup() {
  int i;
  for (i=0; i<njunc.size(); i++) {
   junc[i]=cast<Junction>Router.GetGameObject(njunc[i]);
  }
 }

};

class Semnal isclass Signal {
 public StringTable ST;
 Asset rosu,galben,verde,alb,albastru;
 public JRule[] rules=new JRule[0];
 public int this_aspect;
 public int restriction;
 public int direction;
 public int active_shunt=0;
 public int next_aspect;
 public int next_restrict;
 public int use_instruction=0;
 public int current_config_index=-1;
 public bool junction_querry_ok;
 int memo_aspect=-5;
 int memo_direction=-5;
 int memo_restrict=-5;
 public int is_dtv, is_tmv;
 public Signal nextSignal;
 public string nextSignalName;
 public Signal active_nextSignal;
 public string active_nextSignalName;
 public string thisSignalDisplayName;

 Semnal[] subscribers=new Semnal[0];

 void NotifySubscribers(void) {
  int i;
  for(i=0;i<subscribers.size();i++) {
   PostMessage(subscribers[i],"SchimbareAspect",this_aspect,0);
  }
 }

 void FindRuleIndex(Junction querry) {
  int c;
  int l;
  bool hit=false;
  l=-1;
  junction_querry_ok=false;
  if (rules.size()>0) {
   for (c=0; c<rules.size(); c++) {
    hit=(rules[c].junc.size()>0);
    int j;
    for (j=0; j<rules[c].junc.size(); j++) {
     if (rules[c].junc[j]) {
        hit=hit and (rules[c].junc[j].GetDirection()==rules[c].dir[j]);
        if (rules[c].junc[j]==querry)   junction_querry_ok=true;
     }
     else {
            hit=false;
     }
    }
    if (hit) {l=c;}
   }
  }
  current_config_index=l;
 }

 int FindDirection(void) {
  if (current_config_index==-1) { return 0; }
  return rules[current_config_index].direction_marker;
 }

 int FindLimit(void) {
  int k;
  if (is_dtv) k=0; else if (is_tmv) k=10;
  if (current_config_index==-1) { return k; }
  return rules[current_config_index].slow;
 }

 Signal FindSignal(void) {
  if (current_config_index==-1) { return nextSignal; }
  return rules[current_config_index].nextSignal;
 }

 void Lookup_NextSignal(int direction_index) {
  MapObject nextObject;
  Semnal Skip_test;
  Asset Next_asset;
  StringTable Next_settings;
  GSTrackSearch Create_Automatic_Link;
  int i;

  if (direction_index==-1) {

                             Create_Automatic_Link=me.BeginTrackSearch(true);
                             if (Create_Automatic_Link) {
                                                          A:
                                                             {
                                                               nextObject=Create_Automatic_Link.SearchNext();
                                                             } 
                                                          if (nextObject!=null and (!cast<Signal>nextObject or !Create_Automatic_Link.GetFacingRelativeToSearchDirection())) goto A;
                                                          Skip_test=cast<Semnal>nextObject;
                                                          if (Skip_test)
                                                             {
                                                                Next_asset=Skip_test.GetAsset();
                                                                Next_settings=Next_asset.GetStringTable();    

                                                                if (Str.ToInt(Next_settings.GetString("SIGNAL_DTV_SHUNT")) and !Str.ToInt(Next_settings.GetString("SIGNAL_DTV_EXITENTRY"))) goto A;
                                                                else if (Str.ToInt(Next_settings.GetString("SIGNAL_TMV_SHUNT")) and !Str.ToInt(Next_settings.GetString("SIGNAL_TMV_EXITENTRY"))) goto A;
                                                                     else if (Str.ToInt(Next_settings.GetString("SIGNAL_DTV_REPEATER")) or Str.ToInt(Next_settings.GetString("SIGNAL_TMV_REPEATER"))) goto A;
                                                             }
                                                          nextSignal=cast<Signal>nextObject;
                                                          if (nextSignal) nextSignalName=nextSignal.GetName();
                                                          else nextSignalName="ATENTIE:NU EXISTA!";
                                                          if (nextSignalName=="") nextSignalName="ATENTIE:Fara Nume!";
                                                        }

                          }
  else {
         if (rules[direction_index].dir.size()) 
                                        {

                                           for(i=0;i<rules[direction_index].junc.size();i++) {
                                             if (rules[direction_index].junc[i]!=null) rules[direction_index].junc[i].SetDirection(rules[direction_index].dir[i]);
                                           }
		                           Create_Automatic_Link=me.BeginTrackSearch(true);
                                           if (Create_Automatic_Link) {
                                                                        B:
                                                                           {
                                                                              nextObject=Create_Automatic_Link.SearchNext();
                                                                           } 
                                                                        if (nextObject!=null and (!cast<Signal>nextObject or !Create_Automatic_Link.GetFacingRelativeToSearchDirection())) goto B;
                                                                        Skip_test=cast<Semnal>nextObject;
                                                                        if (Skip_test)
                                                                           {
      
                                                                             Next_asset=Skip_test.GetAsset();
                                                                             Next_settings=Next_asset.GetStringTable();

                                                                             if (Str.ToInt(Next_settings.GetString("SIGNAL_DTV_SHUNT")) and !Str.ToInt(Next_settings.GetString("SIGNAL_DTV_EXITENTRY"))) goto B;
                                                                             else if (Str.ToInt(Next_settings.GetString("SIGNAL_TMV_SHUNT")) and !Str.ToInt(Next_settings.GetString("SIGNAL_TMV_EXITENTRY"))) goto B;
                                                                                   else if (Str.ToInt(Next_settings.GetString("SIGNAL_DTV_REPEATER")) or Str.ToInt(Next_settings.GetString("SIGNAL_TMV_REPEATER"))) goto B;
                                                                           }
				                                        rules[direction_index].nextSignal=cast<Signal>nextObject;
				                                        if (rules[direction_index].nextSignal) rules[direction_index].nextSignalName=rules[direction_index].nextSignal.GetName(); 
                                                                        else rules[direction_index].nextSignalName="ATENTIE:NU EXISTA!";
                                                                        if (rules[direction_index].nextSignalName=="") rules[direction_index].nextSignalName="ATENTIE:Fara Nume!";
                        			                     }

		                       }
     }
 }



 void Lightup_Direction_Marker(void)
 {
  int k;
   if (direction!=memo_direction) {
      memo_direction=direction;
      for(k=100;k<=134;k++) SetFXCoronaTexture(""+k,null);
      switch (direction) {
          case 1:
                  for(k=130;k>=110;k=k-5) SetFXCoronaTexture(""+k,alb);
                  for(k=106;k>=102;k=k-4) SetFXCoronaTexture(""+k,alb);
                  for(k=108;k<=114;k=k+6) SetFXCoronaTexture(""+k,alb);
                  for(k=119;k<=134;k=k+5) SetFXCoronaTexture(""+k,alb);
                  for(k=121;k<=123;k=k+1) SetFXCoronaTexture(""+k,alb);
                  break;
          case 2: 
                  for(k=130;k>=100;k=k-5) SetFXCoronaTexture(""+k,alb);
                  for(k=101;k<=103;k=k+1) SetFXCoronaTexture(""+k,alb);
                  for(k=109;k<=109;k=k+6) SetFXCoronaTexture(""+k,alb);
                  for(k=114;k<=118;k=k+4) SetFXCoronaTexture(""+k,alb);
                  for(k=124;k<=124;k=k+6) SetFXCoronaTexture(""+k,alb);
                  for(k=129;k<=133;k=k+4) SetFXCoronaTexture(""+k,alb);
                  for(k=132;k>=131;k=k-1) SetFXCoronaTexture(""+k,alb);
                  for(k=117;k>=116;k=k-1) SetFXCoronaTexture(""+k,alb);
                  break;
          case 3:
                  for(k=125;k>=105;k=k-5) SetFXCoronaTexture(""+k,alb);
                  for(k=101;k<=103;k=k+1) SetFXCoronaTexture(""+k,alb);
                  for(k=109;k<=109;k=k+6) SetFXCoronaTexture(""+k,alb);
                  for(k=129;k<=133;k=k+4) SetFXCoronaTexture(""+k,alb);
                  for(k=132;k>=131;k=k-1) SetFXCoronaTexture(""+k,alb);
                  break;
          case 4: 
                  for(k=130;k>=100;k=k-5) SetFXCoronaTexture(""+k,alb);
                  for(k=101;k<=103;k=k+1) SetFXCoronaTexture(""+k,alb);
                  for(k=109;k<=109;k=k+6) SetFXCoronaTexture(""+k,alb);
                  for(k=114;k<=129;k=k+5) SetFXCoronaTexture(""+k,alb);
                  for(k=133;k<=133;k=k+4) SetFXCoronaTexture(""+k,alb);
                  for(k=132;k>=131;k=k-1) SetFXCoronaTexture(""+k,alb);
                  break;
          case 5:
                  for(k=130;k>=100;k=k-5) SetFXCoronaTexture(""+k,alb);
                  for(k=101;k<=104;k=k+1) SetFXCoronaTexture(""+k,alb);
                  for(k=118;k>=116;k=k-1) SetFXCoronaTexture(""+k,alb);
                  for(k=134;k>=131;k=k-1) SetFXCoronaTexture(""+k,alb);
                  break;
          case 6: 
                  for(k=130;k>=100;k=k-5) SetFXCoronaTexture(""+k,alb);
                  for(k=101;k<=104;k=k+1) SetFXCoronaTexture(""+k,alb);
                  for(k=118;k>=116;k=k-1) SetFXCoronaTexture(""+k,alb);
                  break;
          case 7:
                  for(k=125;k>=105;k=k-5) SetFXCoronaTexture(""+k,alb);
                  for(k=101;k<=103;k=k+1) SetFXCoronaTexture(""+k,alb);
                  for(k=109;k<=109;k=k+6) SetFXCoronaTexture(""+k,alb);
                  for(k=129;k<=133;k=k+4) SetFXCoronaTexture(""+k,alb);
                  for(k=132;k>=131;k=k-1) SetFXCoronaTexture(""+k,alb);
                  for(k=124;k>=118;k=k-6) SetFXCoronaTexture(""+k,alb);
                  for(k=117;k>=117;k=k-1) SetFXCoronaTexture(""+k,alb);
                  break;
          case 8:
                  for(k=130;k>=100;k=k-5) SetFXCoronaTexture(""+k,alb);
                  for(k=134;k>=104;k=k-5) SetFXCoronaTexture(""+k,alb);
                  for(k=118;k>=116;k=k-1) SetFXCoronaTexture(""+k,alb);
                  break;
          case 9:
                  for(k=101;k<=103;k=k+1) SetFXCoronaTexture(""+k,alb);
                  for(k=131;k<=133;k=k+1) SetFXCoronaTexture(""+k,alb);
                  for(k=107;k<=127;k=k+5) SetFXCoronaTexture(""+k,alb);
                  break;
          case 10:
                  for(k=100;k<=103;k=k+1) SetFXCoronaTexture(""+k,alb);
                  for(k=104;k<=129;k=k+5) SetFXCoronaTexture(""+k,alb);
                  for(k=133;k>=131;k=k-1) SetFXCoronaTexture(""+k,alb);
                  for(k=125;k>=120;k=k-5) SetFXCoronaTexture(""+k,alb);
                  break;
          case 11:
                  for(k=130;k>=100;k=k-5) SetFXCoronaTexture(""+k,alb);
                  for(k=116;k>=104;k=k-4) SetFXCoronaTexture(""+k,alb);
                  for(k=122;k<=134;k=k+6) SetFXCoronaTexture(""+k,alb);
                  break;
          case 12:
                  for(k=130;k>=100;k=k-5) SetFXCoronaTexture(""+k,alb);
                  for(k=131;k<=134;k=k+1) SetFXCoronaTexture(""+k,alb);
                  break;
          case 13:
                  for(k=130;k>=100;k=k-5) SetFXCoronaTexture(""+k,alb);
                  for(k=134;k>=104;k=k-5) SetFXCoronaTexture(""+k,alb);
                  for(k=106;k<=112;k=k+6) SetFXCoronaTexture(""+k,alb);
                  for(k=108;k>=108;k=k-4) SetFXCoronaTexture(""+k,alb);
                  break;
          case 14:
                  for(k=130;k>=100;k=k-5) SetFXCoronaTexture(""+k,alb);
                  for(k=134;k>=104;k=k-5) SetFXCoronaTexture(""+k,alb);
                  for(k=111;k<=123;k=k+6) SetFXCoronaTexture(""+k,alb);
                  break;
          case 15:
                  for(k=125;k>=105;k=k-5) SetFXCoronaTexture(""+k,alb);
                  for(k=129;k>=109;k=k-5) SetFXCoronaTexture(""+k,alb);
                  for(k=101;k<=103;k=k+1) SetFXCoronaTexture(""+k,alb);
                  for(k=131;k<=133;k=k+1) SetFXCoronaTexture(""+k,alb);
                  break;
          case 16:
                  for(k=130;k>=100;k=k-5) SetFXCoronaTexture(""+k,alb);
                  for(k=101;k<=103;k=k+1) SetFXCoronaTexture(""+k,alb);
                  for(k=109;k<=114;k=k+5) SetFXCoronaTexture(""+k,alb);
                  for(k=118;k>=116;k=k-1) SetFXCoronaTexture(""+k,alb);
                  break;
          case 17:
                  for(k=125;k>=105;k=k-5) SetFXCoronaTexture(""+k,alb);
                  for(k=129;k>=109;k=k-5) SetFXCoronaTexture(""+k,alb);
                  for(k=101;k<=103;k=k+1) SetFXCoronaTexture(""+k,alb);
                  for(k=131;k<=133;k=k+1) SetFXCoronaTexture(""+k,alb);
                  for(k=134;k>=122;k=k-6) SetFXCoronaTexture(""+k,alb);
                  break;
          case 18:
                  for(k=130;k>=100;k=k-5) SetFXCoronaTexture(""+k,alb);
                  for(k=101;k<=103;k=k+1) SetFXCoronaTexture(""+k,alb);
                  for(k=109;k<=114;k=k+5) SetFXCoronaTexture(""+k,alb);
                  for(k=118;k>=116;k=k-1) SetFXCoronaTexture(""+k,alb);
                  for(k=134;k>=122;k=k-6) SetFXCoronaTexture(""+k,alb);
                  break;
          case 19:
                  for(k=104;k>=101;k=k-1) SetFXCoronaTexture(""+k,alb);
                  for(k=105;k<=110;k=k+5) SetFXCoronaTexture(""+k,alb);
                  for(k=116;k<=118;k=k+1) SetFXCoronaTexture(""+k,alb);
                  for(k=124;k<=129;k=k+5) SetFXCoronaTexture(""+k,alb);
                  for(k=133;k>=130;k=k-1) SetFXCoronaTexture(""+k,alb);
                  break;
          case 20:
                  for(k=100;k<=104;k=k+1) SetFXCoronaTexture(""+k,alb);
                  for(k=107;k<=132;k=k+5) SetFXCoronaTexture(""+k,alb);
                  break;
          case 21:
                  for(k=125;k>=100;k=k-5) SetFXCoronaTexture(""+k,alb);
                  for(k=129;k>=104;k=k-5) SetFXCoronaTexture(""+k,alb);
                  for(k=131;k<=133;k=k+1) SetFXCoronaTexture(""+k,alb);
                  break;
          case 22:
                  for(k=100;k<=120;k=k+5) SetFXCoronaTexture(""+k,alb);
                  for(k=126;k<=132;k=k+6) SetFXCoronaTexture(""+k,alb);
                  for(k=128;k>=124;k=k-4) SetFXCoronaTexture(""+k,alb);
                  for(k=119;k>=104;k=k-5) SetFXCoronaTexture(""+k,alb);
                  break;
          case 23:
                  for(k=100;k<=125;k=k+5) SetFXCoronaTexture(""+k,alb);
                  for(k=131;k>=127;k=k-4) SetFXCoronaTexture(""+k,alb);
                  for(k=122;k>=117;k=k-5) SetFXCoronaTexture(""+k,alb);
                  for(k=133;k>=129;k=k-4) SetFXCoronaTexture(""+k,alb);
                  for(k=124;k>=104;k=k-5) SetFXCoronaTexture(""+k,alb);
                  break;
          case 24:
                  for(k=100;k<=105;k=k+5) SetFXCoronaTexture(""+k,alb);
                  for(k=125;k<=130;k=k+5) SetFXCoronaTexture(""+k,alb);
                  for(k=104;k<=109;k=k+5) SetFXCoronaTexture(""+k,alb);
                  for(k=129;k<=134;k=k+5) SetFXCoronaTexture(""+k,alb);
                  for(k=111;k<=123;k=k+6) SetFXCoronaTexture(""+k,alb);
                  for(k=121;k>=113;k=k-4) SetFXCoronaTexture(""+k,alb);
                  break;
          case 25:
                  for(k=105;k<=117;k=k+6) SetFXCoronaTexture(""+k,alb);
                  for(k=113;k>=109;k=k-4) SetFXCoronaTexture(""+k,alb);
                  for(k=122;k<=132;k=k+5) SetFXCoronaTexture(""+k,alb);
                  for(k=100;k<=100;k=k+5) SetFXCoronaTexture(""+k,alb);
                  for(k=104;k<=104;k=k+5) SetFXCoronaTexture(""+k,alb);
                  break;
          case 26:
                  for(k=100;k<=104;k=k+1) SetFXCoronaTexture(""+k,alb);
                  for(k=108;k<=120;k=k+4) SetFXCoronaTexture(""+k,alb);
                  for(k=125;k<=130;k=k+5) SetFXCoronaTexture(""+k,alb);
                  for(k=131;k<=134;k=k+1) SetFXCoronaTexture(""+k,alb);
                  for(k=109;k<=109;k=k+5) SetFXCoronaTexture(""+k,alb);
                  break;
          case 27:
                  for(k=102;k<=127;k=k+5) SetFXCoronaTexture(""+k,alb);
                  for(k=132;k>=120;k=k-6) SetFXCoronaTexture(""+k,alb);
                  for(k=128;k>=124;k=k-4) SetFXCoronaTexture(""+k,alb);
                  break;
          default:;
      }
   }
 }

 void TMV_this_limit(int k)
 {
   int l;

   switch (k) {
      case 0:
               for(l=200;l<=234;l++) SetFXCoronaTexture(""+l,null);
               break;
      case 4:
               for(l=201;l<=204;l=l+1) SetFXCoronaTexture(""+l,alb);
               for(l=209;l<=219;l=l+5) SetFXCoronaTexture(""+l,alb);
               for(l=218;l>=216;l=l-1) SetFXCoronaTexture(""+l,alb);
               for(l=221;l<=231;l=l+5) SetFXCoronaTexture(""+l,alb);
               for(l=232;l<=234;l=l+1) SetFXCoronaTexture(""+l,alb);
               SetSpeedLimit(20/3.6);
               break;
      case 5:
               for(l=201;l<=204;l=l+1) SetFXCoronaTexture(""+l,alb);
               for(l=209;l<=234;l=l+5) SetFXCoronaTexture(""+l,alb);
               for(l=233;l>=231;l=l-1) SetFXCoronaTexture(""+l,alb);
               for(l=218;l>=216;l=l-1) SetFXCoronaTexture(""+l,alb);
               SetSpeedLimit(30/3.6);
               break;
      case 6:
               for(l=204;l>=201;l=l-1) SetFXCoronaTexture(""+l,alb);
               for(l=206;l<=231;l=l+5) SetFXCoronaTexture(""+l,alb);
               for(l=232;l<=234;l=l+1) SetFXCoronaTexture(""+l,alb);
               for(l=229;l>=219;l=l-5) SetFXCoronaTexture(""+l,alb);
               for(l=218;l>=217;l=l-1) SetFXCoronaTexture(""+l,alb);
               SetSpeedLimit(60/3.6);
               break;
      case 7:
               for(l=204;l>=201;l=l-1) SetFXCoronaTexture(""+l,alb);
               for(l=206;l<=231;l=l+5) SetFXCoronaTexture(""+l,alb);
               for(l=232;l<=234;l=l+1) SetFXCoronaTexture(""+l,alb);
               for(l=229;l>=204;l=l-5) SetFXCoronaTexture(""+l,alb);
               for(l=218;l>=217;l=l-1) SetFXCoronaTexture(""+l,alb);
               for(l=203;l>=202;l=l-1) SetFXCoronaTexture(""+l,alb);
               SetSpeedLimit(80/3.6);
               break;
      case 8:
               for(l=204;l>=201;l=l-1) SetFXCoronaTexture(""+l,alb);
               for(l=206;l<=216;l=l+5) SetFXCoronaTexture(""+l,alb);
               for(l=231;l<=234;l=l+1) SetFXCoronaTexture(""+l,alb);
               for(l=229;l>=204;l=l-5) SetFXCoronaTexture(""+l,alb);
               for(l=218;l>=217;l=l-1) SetFXCoronaTexture(""+l,alb);
               for(l=203;l>=202;l=l-1) SetFXCoronaTexture(""+l,alb);
               SetSpeedLimit(90/3.6);
               break;
      case 9:
               for(l=204;l>=202;l=l-1) SetFXCoronaTexture(""+l,alb);
               for(l=207;l<=232;l=l+5) SetFXCoronaTexture(""+l,alb);
               for(l=233;l<=234;l=l+1) SetFXCoronaTexture(""+l,alb);
               for(l=229;l>=204;l=l-5) SetFXCoronaTexture(""+l,alb);
               for(l=203;l>=203;l=l-1) SetFXCoronaTexture(""+l,alb);
               for(l=200;l<=230;l=l+5) SetFXCoronaTexture(""+l,alb);
               SetSpeedLimit(100/3.6);
               break;
      case 10:
               for(l=200;l<=234;l++) SetFXCoronaTexture(""+l,null);
               break;
      default:;
   }
 }

 void TMV_next_limit(int k)
 {
   int l;

   switch (k) {
      case 0:
               for(l=300;l<=334;l++) SetFXCoronaTexture(""+l,null);
               break;
      case 4:
               for(l=301;l<=304;l=l+1) SetFXCoronaTexture(""+l,galben);
               for(l=309;l<=319;l=l+5) SetFXCoronaTexture(""+l,galben);
               for(l=318;l>=316;l=l-1) SetFXCoronaTexture(""+l,galben);
               for(l=321;l<=331;l=l+5) SetFXCoronaTexture(""+l,galben);
               for(l=332;l<=334;l=l+1) SetFXCoronaTexture(""+l,galben);
               break;
      case 5:
               for(l=301;l<=304;l=l+1) SetFXCoronaTexture(""+l,galben);
               for(l=309;l<=334;l=l+5) SetFXCoronaTexture(""+l,galben);
               for(l=333;l>=331;l=l-1) SetFXCoronaTexture(""+l,galben);
               for(l=318;l>=316;l=l-1) SetFXCoronaTexture(""+l,galben);
               break;
      case 6:
               for(l=304;l>=301;l=l-1) SetFXCoronaTexture(""+l,galben);
               for(l=306;l<=331;l=l+5) SetFXCoronaTexture(""+l,galben);
               for(l=332;l<=334;l=l+1) SetFXCoronaTexture(""+l,galben);
               for(l=329;l>=319;l=l-5) SetFXCoronaTexture(""+l,galben);
               for(l=318;l>=317;l=l-1) SetFXCoronaTexture(""+l,galben);
               break;
      case 7:
               for(l=304;l>=301;l=l-1) SetFXCoronaTexture(""+l,galben);
               for(l=306;l<=331;l=l+5) SetFXCoronaTexture(""+l,galben);
               for(l=332;l<=334;l=l+1) SetFXCoronaTexture(""+l,galben);
               for(l=329;l>=304;l=l-5) SetFXCoronaTexture(""+l,galben);
               for(l=318;l>=317;l=l-1) SetFXCoronaTexture(""+l,galben);
               for(l=303;l>=302;l=l-1) SetFXCoronaTexture(""+l,galben);
               break;
      case 8:
               for(l=304;l>=301;l=l-1) SetFXCoronaTexture(""+l,galben);
               for(l=306;l<=316;l=l+5) SetFXCoronaTexture(""+l,galben);
               for(l=331;l<=334;l=l+1) SetFXCoronaTexture(""+l,galben);
               for(l=329;l>=304;l=l-5) SetFXCoronaTexture(""+l,galben);
               for(l=318;l>=317;l=l-1) SetFXCoronaTexture(""+l,galben);
               for(l=303;l>=302;l=l-1) SetFXCoronaTexture(""+l,galben);
               break;
      case 9:
               for(l=304;l>=302;l=l-1) SetFXCoronaTexture(""+l,galben);
               for(l=307;l<=332;l=l+5) SetFXCoronaTexture(""+l,galben);
               for(l=333;l<=334;l=l+1) SetFXCoronaTexture(""+l,galben);
               for(l=329;l>=304;l=l-5) SetFXCoronaTexture(""+l,galben);
               for(l=303;l>=303;l=l-1) SetFXCoronaTexture(""+l,galben);
               for(l=300;l<=330;l=l+5) SetFXCoronaTexture(""+l,galben);
               break;
      case 10:
               for(l=300;l<=334;l++) SetFXCoronaTexture(""+l,null);
               break;
      default:;
   }
 }

 void Lights_Off(void)
 {
   switch (Str.ToInt(ST.GetString("LIGHTS_COUNT"))) {
        case 2:
          if (Str.ToInt(ST.GetString("SIGNAL_DTV_SHUNT")))
               {
                 SetFXCoronaTexture("90",null);
                 SetFXCoronaTexture("91",null);
               }
          else {
                 SetFXCoronaTexture("1",null);
                 SetFXCoronaTexture("2",null);
                 SetFXCoronaTexture("3",null);
                 SetFXCoronaTexture("4",null);
                 SetFXCoronaTexture("5",null);
                 SetFXCoronaTexture("6",null);
               }
                 break;
        case 3:
                 SetFXCoronaTexture("0",null);
                 SetFXCoronaTexture("1",null);
                 SetFXCoronaTexture("2",null);
                 SetFXCoronaTexture("3",null);
                 SetFXCoronaTexture("4",null);
                 SetFXCoronaTexture("5",null);
                 SetFXCoronaTexture("6",null);
                 break;
        case 4:
                 SetFXCoronaTexture("0",null);
                 SetFXCoronaTexture("1",null);
                 SetFXCoronaTexture("2",null);
                 SetFXCoronaTexture("3",null);
                 SetFXCoronaTexture("4",null);
                 SetFXCoronaTexture("5",null);
                 SetFXCoronaTexture("6",null);
                 SetFXCoronaTexture("7",null);
                 break;
        case 5:
                 SetFXCoronaTexture("0",null);
                 SetFXCoronaTexture("1",null);
                 SetFXCoronaTexture("2",null);
                 SetFXCoronaTexture("3",null);
                 SetFXCoronaTexture("4",null);
                 SetFXCoronaTexture("5",null);
                 SetFXCoronaTexture("6",null);
                 SetFXCoronaTexture("7",null);
                 SetFXCoronaTexture("91",null);
                 break;
        case 13:
                 SetFXCoronaTexture("50",null);
                 SetFXCoronaTexture("51",null);
                 SetFXCoronaTexture("52",null);
                 SetFXCoronaTexture("53",null);
                 SetFXCoronaTexture("54",null);
                 SetFXCoronaTexture("55",null);
                 SetFXCoronaTexture("56",null);
                 SetFXCoronaTexture("57",null);
                 SetFXCoronaTexture("58",null);
                 SetFXCoronaTexture("59",null);
                 SetFXCoronaTexture("60",null);
                 SetFXCoronaTexture("61",null);
                 SetFXCoronaTexture("62",null);
                 break;
        default:;
   }
   if (is_dtv)
   {
      switch (Str.ToInt(ST.GetString("HAS_BAR")))  {
          case 1:
                    SetFXCoronaTexture("45",null);
                    SetFXCoronaTexture("46",null);
                    SetFXCoronaTexture("47",null);
                    SetFXCoronaTexture("48",null);
                    break;
          case 2:
                    SetFXCoronaTexture("40",null);
                    SetFXCoronaTexture("41",null);
                    SetFXCoronaTexture("42",null);
                    SetFXCoronaTexture("43",null);
                    break;
          case 3:
                    SetFXCoronaTexture("40",null);
                    SetFXCoronaTexture("41",null);
                    SetFXCoronaTexture("42",null);
                    SetFXCoronaTexture("43",null);
                    SetFXCoronaTexture("45",null);
                    SetFXCoronaTexture("46",null);
                    SetFXCoronaTexture("47",null);
                    SetFXCoronaTexture("48",null);
                    break;
          default:;
      }
   }
 }

 void SignalControl_TMV(void)
 {
   if (Str.ToInt(ST.GetString("SIGNAL_TMV_EXITENTRY")))
    {
      if (GetSignalState()==RED) 
         {
           this_aspect=0;
           if (this_aspect!=memo_aspect and !active_shunt) {
                                           NotifySubscribers();
                                           memo_aspect=0;
                                           Lights_Off();
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
                                           if (Str.ToInt(ST.GetString("HAS_DIRECTION_MARKER"))) {
                                            direction=0;
                                            Lightup_Direction_Marker();
                                           }
                                           SetFXCoronaTexture("0",rosu);
                                         }
         }
      else {
           if (!active_shunt)
           {
             restriction=FindLimit();
             switch (next_aspect) {
               case 0:
                switch (restriction) {
                   case 4:
                             this_aspect=101;
                             next_restrict=0;
                             break;
                   case 5:
                             this_aspect=102;
                             next_restrict=0;
                             break;
                   case 6:
                             this_aspect=103;
                             next_restrict=0;
                             break;
                   case 7:
                             this_aspect=104;
                             next_restrict=0;
                             break;
                   case 8:
                             this_aspect=105;
                             next_restrict=0;
                             break;
                   case 9:
                             this_aspect=106;
                             next_restrict=0;
                             break;
                   case 10:
                             this_aspect=100;
                             next_restrict=0;
                             break;
                   default:;
                }
                break;
               case 1:
                switch (restriction) {
                   case 4:
                             this_aspect=115;
                             next_restrict=0;
                             break;
                   case 5:
                             this_aspect=116;
                             next_restrict=0;
                             break;
                   case 6:
                             this_aspect=117;
                             next_restrict=0;
                             break;
                   case 7:
                             this_aspect=118;
                             next_restrict=0;
                             break;
                   case 8:
                             this_aspect=119;
                             next_restrict=0;
                             break;
                   case 9:
                             this_aspect=120;
                             next_restrict=0;
                             break;
                   case 10:
                             this_aspect=107;
                             next_restrict=0;
                             break;
                   default:;
                }
                 break;
               case 2:
                switch (restriction) {
                   case 4:
                             this_aspect=115;
                             next_restrict=0;
                             break;
                   case 5:
                             this_aspect=116;
                             next_restrict=0;
                             break;
                   case 6:
                             this_aspect=117;
                             next_restrict=0;
                             break;
                   case 7:
                             this_aspect=118;
                             next_restrict=0;
                             break;
                   case 8:
                             this_aspect=119;
                             next_restrict=0;
                             break;
                   case 9:
                             this_aspect=120;
                             next_restrict=0;
                             break;
                   case 10:
                             this_aspect=114;
                             next_restrict=0;
                             break;
                   default:;
                }
                break;
               case 3:
                switch (restriction) {
                   case 4:
                             this_aspect=115;
                             next_restrict=0;
                             break;
                   case 5:
                             this_aspect=116;
                             next_restrict=0;
                             break;
                   case 6:
                             this_aspect=117;
                             next_restrict=0;
                             break;
                   case 7:
                             this_aspect=118;
                             next_restrict=0;
                             break;
                   case 8:
                             this_aspect=119;
                             next_restrict=0;
                             break;
                   case 9:
                             this_aspect=120;
                             next_restrict=0;
                             break;
                   case 10:
                             this_aspect=114;
                             next_restrict=0;
                             break;
                   default:;
                }
                break;
               case 4:
                switch (restriction) {
                   case 4:
                             this_aspect=115;
                             next_restrict=0;
                             break;
                   case 5:
                             this_aspect=116;
                             next_restrict=0;
                             break;
                   case 6:
                             this_aspect=117;
                             next_restrict=0;
                             break;
                   case 7:
                             this_aspect=118;
                             next_restrict=0;
                             break;
                   case 8:
                             this_aspect=119;
                             next_restrict=0;
                             break;
                   case 9:
                             this_aspect=120;
                             next_restrict=0;
                             break;
                   case 10:
                             this_aspect=114;
                             next_restrict=0;
                             break;
                   default:;
                }
                break;
               case 5:
                switch (restriction) {
                   case 4:
                             this_aspect=115;
                             next_restrict=0;
                             break;
                   case 5:
                             this_aspect=116;
                             next_restrict=0;
                             break;
                   case 6:
                             this_aspect=117;
                             next_restrict=0;
                             break;
                   case 7:
                             this_aspect=118;
                             next_restrict=0;
                             break;
                   case 8:
                             this_aspect=119;
                             next_restrict=0;
                             break;
                   case 9:
                             this_aspect=120;
                             next_restrict=0;
                             break;
                   case 10:
                             this_aspect=114;
                             next_restrict=0;
                             break;
                   default:;
                }
                break;
               case 6:
                switch (restriction) {
                   case 4:
                             this_aspect=115;
                             next_restrict=0;
                             break;
                   case 5:
                             this_aspect=116;
                             next_restrict=0;
                             break;
                   case 6:
                             this_aspect=117;
                             next_restrict=0;
                             break;
                   case 7:
                             this_aspect=118;
                             next_restrict=0;
                             break;
                   case 8:
                             this_aspect=119;
                             next_restrict=0;
                             break;
                   case 9:
                             this_aspect=120;
                             next_restrict=0;
                             break;
                   case 10:
                             this_aspect=114;
                             next_restrict=0;
                             break;
                   default:;
                }
                break;
               case 7:
                switch (restriction) {
                   case 4:
                             this_aspect=115;
                             next_restrict=0;
                             break;
                   case 5:
                             this_aspect=116;
                             next_restrict=0;
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
                             this_aspect=107;
                             next_restrict=5;
                             break;
                   default:;
                }
                break;
               case 8:
                switch (restriction) {
                   case 4:
                             this_aspect=115;
                             next_restrict=0;
                             break;
                   case 5:
                             this_aspect=116;
                             next_restrict=0;
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
                             this_aspect=107;
                             next_restrict=5;
                             break;
                   default:;
                }
                break;
               case 9:
                switch (restriction) {
                   case 4:
                             this_aspect=115;
                             next_restrict=0;
                             break;
                   case 5:
                             this_aspect=116;
                             next_restrict=0;
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
                             this_aspect=107;
                             next_restrict=5;
                             break;
                   default:;
                }
                break;
               case 10:
                switch (restriction) {
                   case 4:
                             this_aspect=115;
                             next_restrict=0;
                             break;
                   case 5:
                             this_aspect=116;
                             next_restrict=0;
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
                             this_aspect=107;
                             next_restrict=5;
                             break;
                   default:;
                }
                break;
               case 11:
                switch (restriction) {
                   case 4:
                             this_aspect=115;
                             next_restrict=0;
                             break;
                   case 5:
                             this_aspect=116;
                             next_restrict=0;
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
                             this_aspect=107;
                             next_restrict=5;
                             break;
                   default:;
                }
                break;
               case 12:
                switch (restriction) {
                   case 4:
                             this_aspect=115;
                             next_restrict=0;
                             break;
                   case 5:
                             this_aspect=116;
                             next_restrict=0;
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
                             this_aspect=107;
                             next_restrict=5;
                             break;
                   default:;
                }
                break;
               case 13:
                switch (restriction) {
                   case 4:
                             this_aspect=115;
                             next_restrict=0;
                             break;
                   case 5:
                             this_aspect=116;
                             next_restrict=0;
                             break;
                   case 6:
                             this_aspect=117;
                             next_restrict=0;
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
                             this_aspect=107;
                             next_restrict=6;
                             break;
                   default:;
                }
                break;
               case 14:
                switch (restriction) {
                   case 4:
                             this_aspect=115;
                             next_restrict=0;
                             break;
                   case 5:
                             this_aspect=116;
                             next_restrict=0;
                             break;
                   case 6:
                             this_aspect=117;
                             next_restrict=0;
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
                             this_aspect=107;
                             next_restrict=6;
                             break;
                   default:;
                }
                break;
               case 15:
                switch (restriction) {
                   case 4:
                             this_aspect=115;
                             next_restrict=0;
                             break;
                   case 5:
                             this_aspect=116;
                             next_restrict=0;
                             break;
                   case 6:
                             this_aspect=117;
                             next_restrict=0;
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
                             this_aspect=107;
                             next_restrict=6;
                             break;
                   default:;
                }
                break;
               case 16:
                switch (restriction) {
                   case 4:
                             this_aspect=115;
                             next_restrict=0;
                             break;
                   case 5:
                             this_aspect=116;
                             next_restrict=0;
                             break;
                   case 6:
                             this_aspect=117;
                             next_restrict=0;
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
                             this_aspect=107;
                             next_restrict=6;
                             break;
                   default:;
                }
                break;
               case 17:
                switch (restriction) {
                   case 4:
                             this_aspect=115;
                             next_restrict=0;
                             break;
                   case 5:
                             this_aspect=116;
                             next_restrict=0;
                             break;
                   case 6:
                             this_aspect=117;
                             next_restrict=0;
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
                             this_aspect=107;
                             next_restrict=6;
                             break;
                   default:;
                }
                break;
               case 18:
                switch (restriction) {
                   case 4:
                             this_aspect=115;
                             next_restrict=0;
                             break;
                   case 5:
                             this_aspect=116;
                             next_restrict=0;
                             break;
                   case 6:
                             this_aspect=117;
                             next_restrict=0;
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
                             this_aspect=107;
                             next_restrict=6;
                             break;
                   default:;
                }
                break;
               case 19:
                switch (restriction) {
                   case 4:
                             this_aspect=115;
                             next_restrict=0;
                             break;
                   case 5:
                             this_aspect=116;
                             next_restrict=0;
                             break;
                   case 6:
                             this_aspect=117;
                             next_restrict=0;
                             break;
                   case 7:
                             this_aspect=118;
                             next_restrict=0;
                             break;
                   case 8:
                             this_aspect=119;
                             next_restrict=0;
                             break;
                   case 9:
                             this_aspect=113;
                             next_restrict=8;
                             break;
                   case 10:
                             this_aspect=107;
                             next_restrict=8;
                             break;
                   default:;
                }
                break;
               case 20:
                switch (restriction) {
                   case 4:
                             this_aspect=115;
                             next_restrict=0;
                             break;
                   case 5:
                             this_aspect=116;
                             next_restrict=0;
                             break;
                   case 6:
                             this_aspect=117;
                             next_restrict=0;
                             break;
                   case 7:
                             this_aspect=118;
                             next_restrict=0;
                             break;
                   case 8:
                             this_aspect=119;
                             next_restrict=0;
                             break;
                   case 9:
                             this_aspect=113;
                             next_restrict=8;
                             break;
                   case 10:
                             this_aspect=107;
                             next_restrict=8;
                             break;
                   default:;
                }
                break;
               case 21:
                switch (restriction) {
                   case 4:
                             this_aspect=115;
                             next_restrict=0;
                             break;
                   case 5:
                             this_aspect=116;
                             next_restrict=0;
                             break;
                   case 6:
                             this_aspect=117;
                             next_restrict=0;
                             break;
                   case 7:
                             this_aspect=118;
                             next_restrict=0;
                             break;
                   case 8:
                             this_aspect=119;
                             next_restrict=0;
                             break;
                   case 9:
                             this_aspect=113;
                             next_restrict=8;
                             break;
                   case 10:
                             this_aspect=107;
                             next_restrict=8;
                             break;
                   default:;
                }
                break;
               case 22:
                switch (restriction) {
                   case 4:
                             this_aspect=115;
                             next_restrict=0;
                             break;
                   case 5:
                             this_aspect=116;
                             next_restrict=0;
                             break;
                   case 6:
                             this_aspect=117;
                             next_restrict=0;
                             break;
                   case 7:
                             this_aspect=118;
                             next_restrict=0;
                             break;
                   case 8:
                             this_aspect=119;
                             next_restrict=0;
                             break;
                   case 9:
                             this_aspect=113;
                             next_restrict=8;
                             break;
                   case 10:
                             this_aspect=107;
                             next_restrict=8;
                             break;
                   default:;
                }
                break;
               case 23:
                switch (restriction) {
                   case 4:
                             this_aspect=115;
                             next_restrict=0;
                             break;
                   case 5:
                             this_aspect=116;
                             next_restrict=0;
                             break;
                   case 6:
                             this_aspect=117;
                             next_restrict=0;
                             break;
                   case 7:
                             this_aspect=118;
                             next_restrict=0;
                             break;
                   case 8:
                             this_aspect=119;
                             next_restrict=0;
                             break;
                   case 9:
                             this_aspect=113;
                             next_restrict=8;
                             break;
                   case 10:
                             this_aspect=107;
                             next_restrict=8;
                             break;
                   default:;
                }
                break;
               case 24:
                switch (restriction) {
                   case 4:
                             this_aspect=115;
                             next_restrict=0;
                             break;
                   case 5:
                             this_aspect=116;
                             next_restrict=0;
                             break;
                   case 6:
                             this_aspect=117;
                             next_restrict=0;
                             break;
                   case 7:
                             this_aspect=118;
                             next_restrict=0;
                             break;
                   case 8:
                             this_aspect=119;
                             next_restrict=0;
                             break;
                   case 9:
                             this_aspect=113;
                             next_restrict=8;
                             break;
                   case 10:
                             this_aspect=107;
                             next_restrict=8;
                             break;
                   default:;
                }
                break;
               case 100:
                switch (restriction) {
                   case 4:
                             this_aspect=115;
                             next_restrict=0;
                             break;
                   case 5:
                             this_aspect=116;
                             next_restrict=0;
                             break;
                   case 6:
                             this_aspect=117;
                             next_restrict=0;
                             break;
                   case 7:
                             this_aspect=118;
                             next_restrict=0;
                             break;
                   case 8:
                             this_aspect=119;
                             next_restrict=0;
                             break;
                   case 9:
                             this_aspect=120;
                             next_restrict=0;
                             break;
                   case 10:
                             this_aspect=107;
                             next_restrict=0;
                             break;
                   default:;
                }
                break;
               case 101:
                switch (restriction) {
                   case 4:
                             this_aspect=115;
                             next_restrict=0;
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
                             this_aspect=107;
                             next_restrict=4;
                             break;
                   default:;
                }
                break;
               case 102:
                switch (restriction) {
                   case 4:
                             this_aspect=115;
                             next_restrict=0;
                             break;
                   case 5:
                             this_aspect=116;
                             next_restrict=0;
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
                             this_aspect=107;
                             next_restrict=5;
                             break;
                   default:;
                }
                break;
               case 103:
                switch (restriction) {
                   case 4:
                             this_aspect=115;
                             next_restrict=0;
                             break;
                   case 5:
                             this_aspect=116;
                             next_restrict=0;
                             break;
                   case 6:
                             this_aspect=117;
                             next_restrict=0;
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
                             this_aspect=107;
                             next_restrict=6;
                             break;
                   default:;
                }
                break;
               case 104:
                switch (restriction) {
                   case 4:
                             this_aspect=115;
                             next_restrict=0;
                             break;
                   case 5:
                             this_aspect=116;
                             next_restrict=0;
                             break;
                   case 6:
                             this_aspect=117;
                             next_restrict=0;
                             break;
                   case 7:
                             this_aspect=118;
                             next_restrict=0;
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
                             this_aspect=107;
                             next_restrict=7;
                             break;
                   default:;
                }
                break;
               case 105:
                switch (restriction) {
                   case 4:
                             this_aspect=115;
                             next_restrict=0;
                             break;
                   case 5:
                             this_aspect=116;
                             next_restrict=0;
                             break;
                   case 6:
                             this_aspect=117;
                             next_restrict=0;
                             break;
                   case 7:
                             this_aspect=118;
                             next_restrict=0;
                             break;
                   case 8:
                             this_aspect=119;
                             next_restrict=0;
                             break;
                   case 9:
                             this_aspect=113;
                             next_restrict=8;
                             break;
                   case 10:
                             this_aspect=107;
                             next_restrict=8;
                             break;
                   default:;
                }
                break;
               case 106:
                switch (restriction) {
                   case 4:
                             this_aspect=115;
                             next_restrict=0;
                             break;
                   case 5:
                             this_aspect=116;
                             next_restrict=0;
                             break;
                   case 6:
                             this_aspect=117;
                             next_restrict=0;
                             break;
                   case 7:
                             this_aspect=118;
                             next_restrict=0;
                             break;
                   case 8:
                             this_aspect=119;
                             next_restrict=0;
                             break;
                   case 9:
                             this_aspect=120;
                             next_restrict=0;
                             break;
                   case 10:
                             this_aspect=107;
                             next_restrict=9;
                             break;
                   default:;
                }
                break;
               case 107:
                switch (restriction) {
                   case 4:
                             this_aspect=115;
                             next_restrict=0;
                             break;
                   case 5:
                             this_aspect=116;
                             next_restrict=0;
                             break;
                   case 6:
                             this_aspect=117;
                             next_restrict=0;
                             break;
                   case 7:
                             this_aspect=118;
                             next_restrict=0;
                             break;
                   case 8:
                             this_aspect=119;
                             next_restrict=0;
                             break;
                   case 9:
                             this_aspect=120;
                             next_restrict=0;
                             break;
                   case 10:
                             this_aspect=114;
                             next_restrict=0;
                             break;
                   default:;
                }
                break;
               case 108:
                switch (restriction) {
                   case 4:
                             this_aspect=115;
                             next_restrict=0;
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
                             this_aspect=107;
                             next_restrict=4;
                             break;
                   default:;
                }
                break;
               case 109:
                switch (restriction) {
                   case 4:
                             this_aspect=115;
                             next_restrict=0;
                             break;
                   case 5:
                             this_aspect=116;
                             next_restrict=0;
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
                             this_aspect=107;
                             next_restrict=5;
                             break;
                   default:;
                }
                break;
               case 110:
                switch (restriction) {
                   case 4:
                             this_aspect=115;
                             next_restrict=0;
                             break;
                   case 5:
                             this_aspect=116;
                             next_restrict=0;
                             break;
                   case 6:
                             this_aspect=117;
                             next_restrict=0;
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
                             this_aspect=107;
                             next_restrict=6;
                             break;
                   default:;
                }
                break;
               case 111:
                switch (restriction) {
                   case 4:
                             this_aspect=115;
                             next_restrict=0;
                             break;
                   case 5:
                             this_aspect=116;
                             next_restrict=0;
                             break;
                   case 6:
                             this_aspect=117;
                             next_restrict=0;
                             break;
                   case 7:
                             this_aspect=118;
                             next_restrict=0;
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
                             this_aspect=107;
                             next_restrict=7;
                             break;
                   default:;
                }
                break;
               case 112:
                switch (restriction) {
                   case 4:
                             this_aspect=115;
                             next_restrict=0;
                             break;
                   case 5:
                             this_aspect=116;
                             next_restrict=0;
                             break;
                   case 6:
                             this_aspect=117;
                             next_restrict=0;
                             break;
                   case 7:
                             this_aspect=118;
                             next_restrict=0;
                             break;
                   case 8:
                             this_aspect=119;
                             next_restrict=0;
                             break;
                   case 9:
                             this_aspect=113;
                             next_restrict=8;
                             break;
                   case 10:
                             this_aspect=107;
                             next_restrict=8;
                             break;
                   default:;
                }
                break;
               case 113:
                switch (restriction) {
                   case 4:
                             this_aspect=115;
                             next_restrict=0;
                             break;
                   case 5:
                             this_aspect=116;
                             next_restrict=0;
                             break;
                   case 6:
                             this_aspect=117;
                             next_restrict=0;
                             break;
                   case 7:
                             this_aspect=118;
                             next_restrict=0;
                             break;
                   case 8:
                             this_aspect=119;
                             next_restrict=0;
                             break;
                   case 9:
                             this_aspect=120;
                             next_restrict=0;
                             break;
                   case 10:
                             this_aspect=107;
                             next_restrict=9;
                             break;
                   default:;
                }
                break;
               case 114:
                switch (restriction) {
                   case 4:
                             this_aspect=115;
                             next_restrict=0;
                             break;
                   case 5:
                             this_aspect=116;
                             next_restrict=0;
                             break;
                   case 6:
                             this_aspect=117;
                             next_restrict=0;
                             break;
                   case 7:
                             this_aspect=118;
                             next_restrict=0;
                             break;
                   case 8:
                             this_aspect=119;
                             next_restrict=0;
                             break;
                   case 9:
                             this_aspect=120;
                             next_restrict=0;
                             break;
                   case 10:
                             this_aspect=114;
                             next_restrict=0;
                             break;
                   default:;
                }
                break;
               case 115:
                switch (restriction) {
                   case 4:
                             this_aspect=115;
                             next_restrict=0;
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
                             this_aspect=107;
                             next_restrict=4;
                             break;
                   default:;
                }
                break;
               case 116:
                switch (restriction) {
                   case 4:
                             this_aspect=115;
                             next_restrict=0;
                             break;
                   case 5:
                             this_aspect=116;
                             next_restrict=0;
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
                             this_aspect=107;
                             next_restrict=5;
                             break;
                   default:;
                }
                break;
               case 117:
                switch (restriction) {
                   case 4:
                             this_aspect=115;
                             next_restrict=0;
                             break;
                   case 5:
                             this_aspect=116;
                             next_restrict=0;
                             break;
                   case 6:
                             this_aspect=117;
                             next_restrict=0;
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
                             this_aspect=107;
                             next_restrict=6;
                             break;
                   default:;
                }
                break;
               case 118:
                switch (restriction) {
                   case 4:
                             this_aspect=115;
                             next_restrict=0;
                             break;
                   case 5:
                             this_aspect=116;
                             next_restrict=0;
                             break;
                   case 6:
                             this_aspect=117;
                             next_restrict=0;
                             break;
                   case 7:
                             this_aspect=118;
                             next_restrict=0;
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
                             this_aspect=107;
                             next_restrict=7;
                             break;
                   default:;
                }
                break;
               case 119:
                switch (restriction) {
                   case 4:
                             this_aspect=115;
                             next_restrict=0;
                             break;
                   case 5:
                             this_aspect=116;
                             next_restrict=0;
                             break;
                   case 6:
                             this_aspect=117;
                             next_restrict=0;
                             break;
                   case 7:
                             this_aspect=118;
                             next_restrict=0;
                             break;
                   case 8:
                             this_aspect=119;
                             next_restrict=0;
                             break;
                   case 9:
                             this_aspect=113;
                             next_restrict=8;
                             break;
                   case 10:
                             this_aspect=107;
                             next_restrict=8;
                             break;
                   default:;
                }
                break;
               case 120:
                switch (restriction) {
                   case 4:
                             this_aspect=115;
                             next_restrict=0;
                             break;
                   case 5:
                             this_aspect=116;
                             next_restrict=0;
                             break;
                   case 6:
                             this_aspect=117;
                             next_restrict=0;
                             break;
                   case 7:
                             this_aspect=118;
                             next_restrict=0;
                             break;
                   case 8:
                             this_aspect=119;
                             next_restrict=0;
                             break;
                   case 9:
                             this_aspect=120;
                             next_restrict=0;
                             break;
                   case 10:
                             this_aspect=107;
                             next_restrict=9;
                             break;
                   default:;
                }
                break;
               default:;
             }                                                                             
             
             if (Str.ToInt(ST.GetString("HAS_DIRECTION_MARKER"))) {
              direction=FindDirection();
              Lightup_Direction_Marker();
             }

             if (this_aspect!=memo_aspect or next_restrict!=memo_restrict)
             {
               memo_aspect=this_aspect;
               memo_restrict=next_restrict;
               NotifySubscribers();
               Lights_Off();
               if (Str.ToInt(ST.GetString("HAS_BAR"))==1) {
                                                              TMV_this_limit(0);
                                                            }
               if (Str.ToInt(ST.GetString("HAS_BAR"))==2) {
                                                              TMV_next_limit(0);
                                                            }
               if (Str.ToInt(ST.GetString("HAS_BAR"))==3) {
                                                              TMV_this_limit(0);
                                                              TMV_next_limit(0);
                                                            }
               if (this_aspect>=100 and this_aspect<=106) SetFXCoronaTexture("1",galben);
               if (this_aspect>=107 and this_aspect<=113) SetFXCoronaTexture("5",verde);
               if (this_aspect>=114 and this_aspect<=120) SetFXCoronaTexture("2",verde);
               if (Str.ToInt(ST.GetString("HAS_BAR"))!=2 and restriction!=10) {
                                                                                  TMV_this_limit(restriction);
                                                                                }
               if (Str.ToInt(ST.GetString("HAS_BAR"))>=2) {
                                                               TMV_next_limit(next_restrict);
                                                            }
             }
           }
           }
    }

   if (Str.ToInt(ST.GetString("SIGNAL_TMV_LINE_BLOCK")))
    {
      if (GetSignalState()==RED) 
         {
           this_aspect=0;
           if (this_aspect!=memo_aspect) {
                                           NotifySubscribers();
                                           memo_aspect=0;
                                           Lights_Off();
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
                                           SetFXCoronaTexture("0",rosu);
                                         }
         }
      else {           
             switch (next_aspect) {
               case 0:
                 this_aspect=100;
                 next_restrict=0;
                 break;
               case 1:
                 this_aspect=107;
                 next_restrict=0;
                 break;
               case 2:
                 this_aspect=114;
                 next_restrict=0;
                 break;
               case 3:
                 this_aspect=114;
                 next_restrict=0;
                 break;
               case 4:
                 this_aspect=114;
                 next_restrict=0;
                 break;
               case 5:
                 this_aspect=114;
                 next_restrict=0;
                 break;
               case 6:
                 this_aspect=114;
                 next_restrict=0;
                 break;
               case 7:
                 this_aspect=107;
                 next_restrict=5;
                 break;
               case 8:
                 this_aspect=107;
                 next_restrict=5;
                 break;
               case 9:
                 this_aspect=107;
                 next_restrict=5;
                 break;
               case 10:
                 this_aspect=107;
                 next_restrict=5;
                 break;
               case 11:
                 this_aspect=107;
                 next_restrict=5;
                 break;
               case 12:
                 this_aspect=107;
                 next_restrict=5;
                 break;
               case 13:
                 this_aspect=107;
                 next_restrict=6;
                 break;
               case 14:
                 this_aspect=107;
                 next_restrict=6;
                 break;
               case 15:
                 this_aspect=107;
                 next_restrict=6;
                 break;
               case 16:
                 this_aspect=107;
                 next_restrict=6;
                 break;
               case 17:
                 this_aspect=107;
                 next_restrict=6;
                 break;
               case 18:
                 this_aspect=107;
                 next_restrict=6;
                 break;
               case 19:
                 this_aspect=107;
                 next_restrict=8;
                 break;
               case 20:
                 this_aspect=107;
                 next_restrict=8;
                 break;
               case 21:
                 this_aspect=107;
                 next_restrict=8;
                 break;
               case 22:
                 this_aspect=107;
                 next_restrict=8;
                 break;
               case 23:
                 this_aspect=107;
                 next_restrict=8;
                 break;
               case 24:
                 this_aspect=107;
                 next_restrict=8;
                 break;
               case 100:
                 this_aspect=107;
                 next_restrict=0;
                 break;
               case 101:
                 this_aspect=107;
                 next_restrict=4;
                 break;
               case 102:
                 this_aspect=107;
                 next_restrict=5;
                 break;
               case 103:
                 this_aspect=107;
                 next_restrict=6;
                 break;
               case 104:
                 this_aspect=107;
                 next_restrict=7;
                 break;
               case 105:
                 this_aspect=107;
                 next_restrict=8;
                 break;
               case 106:
                 this_aspect=107;
                 next_restrict=9;
                 break;
               case 107:
                 this_aspect=114;
                 next_restrict=0;
                 break;
               case 108:
                 this_aspect=107;
                 next_restrict=4;
                 break;
               case 109:
                 this_aspect=107;
                 next_restrict=5;
                 break;
               case 110:
                 this_aspect=107;
                 next_restrict=6;
                 break;
               case 111:
                 this_aspect=107;
                 next_restrict=7;
                 break;
               case 112:
                 this_aspect=107;
                 next_restrict=8;
                 break;
               case 113:
                 this_aspect=107;
                 next_restrict=9;
                 break;
               case 114:
                 this_aspect=114;
                 next_restrict=0;
                 break;
               case 115:
                 this_aspect=107;
                 next_restrict=4;
                 break;
               case 116:
                 this_aspect=107;
                 next_restrict=5;
                 break;
               case 117:
                 this_aspect=107;
                 next_restrict=6;
                 break;
               case 118:
                 this_aspect=107;
                 next_restrict=7;
                 break;
               case 119:
                 this_aspect=107;
                 next_restrict=8;
                 break;
               case 120:
                 this_aspect=107;
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
               if (Str.ToInt(ST.GetString("HAS_BAR"))==2) {
                                                              TMV_next_limit(0);
                                                            }
               if (this_aspect>=100 and this_aspect<=106) SetFXCoronaTexture("1",galben);
               if (this_aspect>=107 and this_aspect<=113) SetFXCoronaTexture("5",verde);
               if (this_aspect>=114 and this_aspect<=120) SetFXCoronaTexture("2",verde);
               if (Str.ToInt(ST.GetString("HAS_BAR"))==2) {
                                                               TMV_next_limit(next_restrict);
                                                            }
             }
           }
    }

   if (Str.ToInt(ST.GetString("SIGNAL_TMV_DISTANT")))
     {
             switch (next_aspect) {
               case 0:
                 this_aspect=100;
                 next_restrict=0;
                 break;
               case 1:
                 this_aspect=107;
                 next_restrict=0;
                 break;
               case 2:
                 this_aspect=114;
                 next_restrict=0;
                 break;
               case 3:
                 this_aspect=114;
                 next_restrict=0;
                 break;
               case 4:
                 this_aspect=114;
                 next_restrict=0;
                 break;
               case 5:
                 this_aspect=114;
                 next_restrict=0;
                 break;
               case 6:
                 this_aspect=114;
                 next_restrict=0;
                 break;
               case 7:
                 this_aspect=107;
                 next_restrict=5;
                 break;
               case 8:
                 this_aspect=107;
                 next_restrict=5;
                 break;
               case 9:
                 this_aspect=107;
                 next_restrict=5;
                 break;
               case 10:
                 this_aspect=107;
                 next_restrict=5;
                 break;
               case 11:
                 this_aspect=107;
                 next_restrict=5;
                 break;
               case 12:
                 this_aspect=107;
                 next_restrict=5;
                 break;
               case 13:
                 this_aspect=107;
                 next_restrict=6;
                 break;
               case 14:
                 this_aspect=107;
                 next_restrict=6;
                 break;
               case 15:
                 this_aspect=107;
                 next_restrict=6;
                 break;
               case 16:
                 this_aspect=107;
                 next_restrict=6;
                 break;
               case 17:
                 this_aspect=107;
                 next_restrict=6;
                 break;
               case 18:
                 this_aspect=107;
                 next_restrict=6;
                 break;
               case 19:
                 this_aspect=107;
                 next_restrict=8;
                 break;
               case 20:
                 this_aspect=107;
                 next_restrict=8;
                 break;
               case 21:
                 this_aspect=107;
                 next_restrict=8;
                 break;
               case 22:
                 this_aspect=107;
                 next_restrict=8;
                 break;
               case 23:
                 this_aspect=107;
                 next_restrict=8;
                 break;
               case 24:
                 this_aspect=107;
                 next_restrict=8;
                 break;
               case 100:
                 this_aspect=107;
                 next_restrict=0;
                 break;
               case 101:
                 this_aspect=107;
                 next_restrict=4;
                 break;
               case 102:
                 this_aspect=107;
                 next_restrict=5;
                 break;
               case 103:
                 this_aspect=107;
                 next_restrict=6;
                 break;
               case 104:
                 this_aspect=107;
                 next_restrict=7;
                 break;
               case 105:
                 this_aspect=107;
                 next_restrict=8;
                 break;
               case 106:
                 this_aspect=107;
                 next_restrict=9;
                 break;
               case 107:
                 this_aspect=114;
                 next_restrict=0;
                 break;
               case 108:
                 this_aspect=107;
                 next_restrict=4;
                 break;
               case 109:
                 this_aspect=107;
                 next_restrict=5;
                 break;
               case 110:
                 this_aspect=107;
                 next_restrict=6;
                 break;
               case 111:
                 this_aspect=107;
                 next_restrict=7;
                 break;
               case 112:
                 this_aspect=107;
                 next_restrict=8;
                 break;
               case 113:
                 this_aspect=107;
                 next_restrict=9;
                 break;
               case 114:
                 this_aspect=114;
                 next_restrict=0;
                 break;
               case 115:
                 this_aspect=107;
                 next_restrict=4;
                 break;
               case 116:
                 this_aspect=107;
                 next_restrict=5;
                 break;
               case 117:
                 this_aspect=107;
                 next_restrict=6;
                 break;
               case 118:
                 this_aspect=107;
                 next_restrict=7;
                 break;
               case 119:
                 this_aspect=107;
                 next_restrict=8;
                 break;
               case 120:
                 this_aspect=107;
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
               if (Str.ToInt(ST.GetString("HAS_BAR"))==2) {
                                                              TMV_next_limit(0);
                                                            }
               if (this_aspect>=100 and this_aspect<=106) SetFXCoronaTexture("1",galben);
               if (this_aspect>=107 and this_aspect<=113) SetFXCoronaTexture("5",verde);
               if (this_aspect>=114 and this_aspect<=120) SetFXCoronaTexture("2",verde);
               if (Str.ToInt(ST.GetString("HAS_BAR"))==2) {
                                                               TMV_next_limit(next_restrict);
                                                            }
             }
     }

   if (Str.ToInt(ST.GetString("SIGNAL_TMV_REPEATER")))
    {
             this_aspect=next_aspect;                                                                              
             if (this_aspect!=memo_aspect)
             {
               memo_aspect=this_aspect;
               NotifySubscribers();
               Lights_Off();
               if (this_aspect==0)
                                   {
                                      SetFXCoronaTexture("50",alb);
                                      SetFXCoronaTexture("51",alb);
                                      SetFXCoronaTexture("52",alb);
                                      SetFXCoronaTexture("53",alb);
                                      SetFXCoronaTexture("57",alb);
                                      SetFXCoronaTexture("58",alb);
                                      SetFXCoronaTexture("59",alb);
                                   }
               if (this_aspect==1 or this_aspect>=3 and this_aspect<=113) 
                                   {
                                      SetFXCoronaTexture("50",alb);
                                      SetFXCoronaTexture("51",alb);
                                      SetFXCoronaTexture("52",alb);
                                      SetFXCoronaTexture("53",alb);
                                      SetFXCoronaTexture("54",alb);
                                      SetFXCoronaTexture("55",alb);
                                      SetFXCoronaTexture("56",alb);
                                   }
               if (this_aspect==2 or this_aspect>=114)
                                   {
                                      SetFXCoronaTexture("50",alb);
                                      SetFXCoronaTexture("51",alb);
                                      SetFXCoronaTexture("52",alb);
                                      SetFXCoronaTexture("53",alb);
                                      SetFXCoronaTexture("60",alb);
                                      SetFXCoronaTexture("61",alb);
                                      SetFXCoronaTexture("62",alb);
                                   }
             }
    }  
 }

 void SignalControl_DTV2(void)
 {
   if (Str.ToInt(ST.GetString("SIGNAL_DTV_EXITENTRY")))
    {
      if (GetSignalState()==RED) 
         {
           this_aspect=0;
           if (this_aspect!=memo_aspect and !active_shunt) {
                                           NotifySubscribers();
                                           memo_aspect=0;
                                           Lights_Off();
                                           if (Str.ToInt(ST.GetString("HAS_DIRECTION_MARKER"))) {
                                            direction=0;
                                            Lightup_Direction_Marker();
                                           }
                                           SetFXCoronaTexture("0",rosu);
                                         }
         }
      else {           
           if (!active_shunt)
           {
             switch (next_aspect) {
               case 0:
                this_aspect=1;
                break;
               case 1:
                this_aspect=5;
                break;
               case 2:
                this_aspect=2;
                break;
               case 3:
                this_aspect=2;
                break;
               case 4:
                this_aspect=2;
                break;
               case 5:
                this_aspect=2;
                break;
               case 6:
                this_aspect=2;
                break;
               case 7:
                this_aspect=3;
                break;
               case 8:
                this_aspect=3;
                break;
               case 9:
                this_aspect=3;
                break;
               case 10:
                this_aspect=3;
                break;
               case 11:
                this_aspect=3;
                break;
               case 12:
                this_aspect=3;
                break;
               case 13:
                this_aspect=4;
                break;
               case 14:
                this_aspect=4;
                break;
               case 15:
                this_aspect=4;
                break;
               case 16:
                this_aspect=4;
                break;
               case 17:
                this_aspect=4;
                break;
               case 18:
                this_aspect=4;
                break;
               case 19:
                this_aspect=6;
                break;
               case 20:
                this_aspect=6;
                break;
               case 21:
                this_aspect=6;
                break;
               case 22:
                this_aspect=6;
                break;
               case 23:
                this_aspect=6;
                break;
               case 24:
                this_aspect=6;
                break;
               case 91:
                this_aspect=1;
                break;
               default:;
             }
             if (next_aspect>=100) this_aspect=5;
             restriction=FindLimit();
             switch (restriction) {
                 case 1: 
                          this_aspect=this_aspect + 6;                         
                          break;
                 case 2: 
                          switch (Str.ToInt(ST.GetString("HAS_BAR"))) {
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
                 case 3:
                          switch (Str.ToInt(ST.GetString("HAS_BAR"))) {
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
                 default:;               
             }

             if (Str.ToInt(ST.GetString("HAS_DIRECTION_MARKER"))) {
              direction=FindDirection();
              Lightup_Direction_Marker();
             }
             
             if (this_aspect!=memo_aspect)
             {
               NotifySubscribers();
               memo_aspect=this_aspect;
               Lights_Off();
               switch (this_aspect) {
                 case 1:
                  SetFXCoronaTexture("1",galben);
                  break;
                 case 2:
                  SetFXCoronaTexture("2",verde);
                  break;
                 case 3:
                  SetFXCoronaTexture("3",galben);
                  break;
                 case 4:
                  SetFXCoronaTexture("4",galben);
                  break;
                 case 5:
                  SetFXCoronaTexture("5",verde);
                  break;
                 case 6:
                  SetFXCoronaTexture("6",verde);
                  break;
                 case 7:
                  SetFXCoronaTexture("1",galben);
                  SetFXCoronaTexture("7",galben);
                  SetSpeedLimit(30/3.6);
                  break;
                 case 8:
                  SetFXCoronaTexture("2",verde);
                  SetFXCoronaTexture("7",galben);
                  SetSpeedLimit(30/3.6);
                  break;
                 case 9:
                  SetFXCoronaTexture("3",galben);
                  SetFXCoronaTexture("7",galben);
                  SetSpeedLimit(30/3.6);
                  break;
                 case 10:
                  SetFXCoronaTexture("4",galben);
                  SetFXCoronaTexture("7",galben);
                  SetSpeedLimit(30/3.6);
                  break;
                 case 11:
                  SetFXCoronaTexture("5",verde);
                  SetFXCoronaTexture("7",galben);
                  SetSpeedLimit(30/3.6);
                  break;
                 case 12:
                  SetFXCoronaTexture("6",verde);
                  SetFXCoronaTexture("7",galben);
                  SetSpeedLimit(30/3.6);
                  break;
                 case 13:
                  SetFXCoronaTexture("1",galben);
                  SetFXCoronaTexture("7",galben);
                  SetFXCoronaTexture("45",galben);
                  SetFXCoronaTexture("46",galben);
                  SetFXCoronaTexture("47",galben);
                  SetFXCoronaTexture("48",galben);
                  SetFXCoronaTexture("49",galben);
                  SetSpeedLimit(60/3.6);
                  break;
                 case 14:
                  SetFXCoronaTexture("2",verde);
                  SetFXCoronaTexture("7",galben);
                  SetFXCoronaTexture("45",galben);
                  SetFXCoronaTexture("46",galben);
                  SetFXCoronaTexture("47",galben);
                  SetFXCoronaTexture("48",galben);
                  SetSpeedLimit(60/3.6);
                  break;
                 case 15:
                  SetFXCoronaTexture("3",galben);
                  SetFXCoronaTexture("7",galben);
                  SetFXCoronaTexture("45",galben);
                  SetFXCoronaTexture("46",galben);
                  SetFXCoronaTexture("47",galben);
                  SetFXCoronaTexture("48",galben);
                  SetSpeedLimit(60/3.6);
                  break;
                 case 16:
                  SetFXCoronaTexture("4",galben);
                  SetFXCoronaTexture("7",galben);
                  SetFXCoronaTexture("45",galben);
                  SetFXCoronaTexture("46",galben);
                  SetFXCoronaTexture("47",galben);
                  SetFXCoronaTexture("48",galben);
                  SetSpeedLimit(60/3.6);
                  break;
                 case 17:
                  SetFXCoronaTexture("5",verde);
                  SetFXCoronaTexture("7",galben);
                  SetFXCoronaTexture("45",galben);
                  SetFXCoronaTexture("46",galben);
                  SetFXCoronaTexture("47",galben);
                  SetFXCoronaTexture("48",galben);
                  SetSpeedLimit(60/3.6);
                  break;
                 case 18:
                  SetFXCoronaTexture("6",verde);
                  SetFXCoronaTexture("7",galben);
                  SetFXCoronaTexture("45",galben);
                  SetFXCoronaTexture("46",galben);
                  SetFXCoronaTexture("47",galben);
                  SetFXCoronaTexture("48",galben);
                  SetSpeedLimit(60/3.6);
                  break;
                 case 19:
                  SetFXCoronaTexture("1",galben);
                  SetFXCoronaTexture("7",galben);
                  SetFXCoronaTexture("40",verde);
                  SetFXCoronaTexture("41",verde);
                  SetFXCoronaTexture("42",verde);
                  SetFXCoronaTexture("43",verde);
                  SetSpeedLimit(90/3.6);
                  break;
                 case 20:
                  SetFXCoronaTexture("2",verde);
                  SetFXCoronaTexture("7",galben);
                  SetFXCoronaTexture("40",verde);
                  SetFXCoronaTexture("41",verde);
                  SetFXCoronaTexture("42",verde);
                  SetFXCoronaTexture("43",verde);
                  SetSpeedLimit(90/3.6);
                  break;
                 case 21:
                  SetFXCoronaTexture("3",galben);
                  SetFXCoronaTexture("7",galben);
                  SetFXCoronaTexture("40",verde);
                  SetFXCoronaTexture("41",verde);
                  SetFXCoronaTexture("42",verde);
                  SetFXCoronaTexture("43",verde);
                  SetSpeedLimit(90/3.6);
                  break;
                 case 22:
                  SetFXCoronaTexture("4",galben);
                  SetFXCoronaTexture("7",galben);
                  SetFXCoronaTexture("40",verde);
                  SetFXCoronaTexture("41",verde);
                  SetFXCoronaTexture("42",verde);
                  SetFXCoronaTexture("43",verde);
                  SetSpeedLimit(90/3.6);
                  break;
                 case 23:
                  SetFXCoronaTexture("5",verde);
                  SetFXCoronaTexture("7",galben);
                  SetFXCoronaTexture("40",verde);
                  SetFXCoronaTexture("41",verde);
                  SetFXCoronaTexture("42",verde);
                  SetFXCoronaTexture("43",verde);
                  SetSpeedLimit(90/3.6);
                  break;
                 case 24:
                  SetFXCoronaTexture("6",verde);
                  SetFXCoronaTexture("7",galben);
                  SetFXCoronaTexture("40",verde);
                  SetFXCoronaTexture("41",verde);
                  SetFXCoronaTexture("42",verde);
                  SetFXCoronaTexture("43",verde);
                  SetSpeedLimit(90/3.6);
                  break;
                 default:;
               }
             }
           }
           }
    }

   if (Str.ToInt(ST.GetString("SIGNAL_DTV_LINE_BLOCK")))
    {
      if (GetSignalState()==RED) 
         {
           this_aspect=0;
           if (this_aspect!=memo_aspect) {
                                           NotifySubscribers();
                                           memo_aspect=0;
                                           Lights_Off();
                                           SetFXCoronaTexture("0",rosu);
                                         }
         }
      else {
             switch (next_aspect) {
               case 0:
                this_aspect=1;
                break;
               case 1:
                this_aspect=5;
                break;
               case 2:
                this_aspect=2;
                break;
               case 3:
                this_aspect=2;
                break;
               case 4:
                this_aspect=2;
                break;
               case 5:
                this_aspect=2;
                break;
               case 6:
                this_aspect=2;
                break;
               case 7:
                this_aspect=3;
                break;
               case 8:
                this_aspect=3;
                break;
               case 9:
                this_aspect=3;
                break;
               case 10:
                this_aspect=3;
                break;
               case 11:
                this_aspect=3;
                break;
               case 12:
                this_aspect=3;
                break;
               case 13:
                this_aspect=4;
                break;
               case 14:
                this_aspect=4;
                break;
               case 15:
                this_aspect=4;
                break;
               case 16:
                this_aspect=4;
                break;
               case 17:
                this_aspect=4;
                break;
               case 18:
                this_aspect=4;
                break;
               case 19:
                this_aspect=6;
                break;
               case 20:
                this_aspect=6;
                break;
               case 21:
                this_aspect=6;
                break;
               case 22:
                this_aspect=6;
                break;
               case 23:
                this_aspect=6;
                break;
               case 24:
                this_aspect=6;
                break;
               case 91:
                this_aspect=1;
                break;
               default:;
             }                                                                                                
             if (next_aspect>=100) this_aspect=5;             
             if (this_aspect!=memo_aspect)
             {
               NotifySubscribers();
               memo_aspect=this_aspect;
               Lights_Off();
               switch (this_aspect) {
                 case 1:
                  SetFXCoronaTexture("1",galben);
                  break;
                 case 2:
                  SetFXCoronaTexture("2",verde);
                  break;
                 case 3:
                  SetFXCoronaTexture("3",galben);
                  break;
                 case 4:
                  SetFXCoronaTexture("4",galben);
                  break;
                 case 5:
                  SetFXCoronaTexture("5",verde);
                  break;
                 case 6:
                  SetFXCoronaTexture("6",verde);
                  break;
                 default:;
               }
             }
           }
    }

   if (Str.ToInt(ST.GetString("SIGNAL_DTV_DISTANT")))
    {
             switch (next_aspect) {
               case 0:
                this_aspect=1;
                break;
               case 1:
                this_aspect=5;
                break;
               case 2:
                this_aspect=2;
                break;
               case 3:
                this_aspect=2;
                break;
               case 4:
                this_aspect=2;
                break;
               case 5:
                this_aspect=2;
                break;
               case 6:
                this_aspect=2;
                break;
               case 7:
                this_aspect=3;
                break;
               case 8:
                this_aspect=3;
                break;
               case 9:
                this_aspect=3;
                break;
               case 10:
                this_aspect=3;
                break;
               case 11:
                this_aspect=3;
                break;
               case 12:
                this_aspect=3;
                break;
               case 13:
                this_aspect=4;
                break;
               case 14:
                this_aspect=4;
                break;
               case 15:
                this_aspect=4;
                break;
               case 16:
                this_aspect=4;
                break;
               case 17:
                this_aspect=4;
                break;
               case 18:
                this_aspect=4;
                break;
               case 19:
                this_aspect=6;
                break;
               case 20:
                this_aspect=6;
                break;
               case 21:
                this_aspect=6;
                break;
               case 22:
                this_aspect=6;
                break;
               case 23:
                this_aspect=6;
                break;
               case 24:
                this_aspect=6;
                break;
               case 91:
                this_aspect=1;
                break;
               default:;
             }
             if (next_aspect>=100) this_aspect=5;                                                                                                             
             if (this_aspect!=memo_aspect)
             {
               NotifySubscribers();
               memo_aspect=this_aspect;
               Lights_Off();
               switch (this_aspect) {
                 case 1:
                  SetFXCoronaTexture("1",galben);
                  break;
                 case 2:
                  SetFXCoronaTexture("2",verde);
                  break;
                 case 3:
                  SetFXCoronaTexture("3",galben);
                  break;
                 case 4:
                  SetFXCoronaTexture("4",galben);
                  break;
                 case 5:
                  SetFXCoronaTexture("5",verde);
                  break;
                 case 6:
                  SetFXCoronaTexture("6",verde);
                  break;
                 default:;
               }
             }
    }

   if (Str.ToInt(ST.GetString("SIGNAL_DTV_REPEATER")))
    {
             this_aspect=next_aspect;                                                                              
             if (this_aspect!=memo_aspect)
             {
               memo_aspect=this_aspect;
               NotifySubscribers();
               Lights_Off();
               if (this_aspect==0)
                                   {
                                      SetFXCoronaTexture("50",alb);
                                      SetFXCoronaTexture("51",alb);
                                      SetFXCoronaTexture("52",alb);
                                      SetFXCoronaTexture("53",alb);
                                      SetFXCoronaTexture("57",alb);
                                      SetFXCoronaTexture("58",alb);
                                      SetFXCoronaTexture("59",alb);
                                   }
               if (this_aspect==1 or this_aspect>=3 and this_aspect<=113) 
                                   {
                                      SetFXCoronaTexture("50",alb);
                                      SetFXCoronaTexture("51",alb);
                                      SetFXCoronaTexture("52",alb);
                                      SetFXCoronaTexture("53",alb);
                                      SetFXCoronaTexture("54",alb);
                                      SetFXCoronaTexture("55",alb);
                                      SetFXCoronaTexture("56",alb);
                                   }
               if (this_aspect==2 or this_aspect>=114)
                                   {
                                      SetFXCoronaTexture("50",alb);
                                      SetFXCoronaTexture("51",alb);
                                      SetFXCoronaTexture("52",alb);
                                      SetFXCoronaTexture("53",alb);
                                      SetFXCoronaTexture("60",alb);
                                      SetFXCoronaTexture("61",alb);
                                      SetFXCoronaTexture("62",alb);
                                   }
             }
    }

   if (Str.ToInt(ST.GetString("SIGNAL_DTV_SHUNT")))
    {
      if (!active_shunt and !Str.ToInt(ST.GetString("SIGNAL_DTV_EXITENTRY")))
           {
             this_aspect=next_aspect;
             if (this_aspect!=memo_aspect)
                {
                  memo_aspect=this_aspect;
                  NotifySubscribers();
                  Lights_Off();
                  SetFXCoronaTexture("90",albastru);
                }
           }
      if (active_shunt)
           {
            if (this_aspect!=91)
             {
               this_aspect=91;
               memo_aspect=91;
               NotifySubscribers();
               Lights_Off();
               if (Str.ToInt(ST.GetString("HAS_DIRECTION_MARKER")))
                  {
                    direction=0;
                    Lightup_Direction_Marker();
                  }
               SetSpeedLimit(15/3.6);
               SetFXCoronaTexture("91",alb);
             }
           }
    } 
 }

 void SignalControl_DTV(void)
 {
   if (Str.ToInt(ST.GetString("SIGNAL_DTV_EXITENTRY")))
    {
      if (GetSignalState()==RED) 
         {
           this_aspect=0;
           if (this_aspect!=memo_aspect and !active_shunt) {
                                           NotifySubscribers();
                                           memo_aspect=0;
                                           Lights_Off();
                                           if (Str.ToInt(ST.GetString("HAS_DIRECTION_MARKER"))) {
                                            direction=0;
                                            Lightup_Direction_Marker();
                                           }
                                           SetFXCoronaTexture("0",rosu);
                                         }
         }
      else {
           if (!active_shunt)
           {
             switch (next_aspect) {
               case 0:
                this_aspect=1;
                break;
               case 1:
                this_aspect=2;
                break;
               case 2:
                this_aspect=2;
                break;
               case 3:
                this_aspect=2;
                break;
               case 4:
                this_aspect=2;
                break;
               case 5:
                this_aspect=2;
                break;
               case 6:
                this_aspect=2;
                break;
               case 7:
                this_aspect=3;
                break;
               case 8:
                this_aspect=3;
                break;
               case 9:
                this_aspect=3;
                break;
               case 10:
                this_aspect=3;
                break;
               case 11:
                this_aspect=3;
                break;
               case 12:
                this_aspect=3;
                break;
               case 13:
                this_aspect=4;
                break;
               case 14:
                this_aspect=4;
                break;
               case 15:
                this_aspect=4;
                break;
               case 16:
                this_aspect=4;
                break;
               case 17:
                this_aspect=4;
                break;
               case 18:
                this_aspect=4;
                break;
               case 19:
                this_aspect=6;
                break;
               case 20:
                this_aspect=6;
                break;
               case 21:
                this_aspect=6;
                break;
               case 22:
                this_aspect=6;
                break;
               case 23:
                this_aspect=6;
                break;
               case 24:
                this_aspect=6;
                break;
               case 91:
                this_aspect=1;
                break;
               default:;
             }
             if (next_aspect>=100) this_aspect=2;
             if (Str.ToInt(ST.GetString("HAS_DIRECTION_MARKER"))) {
              direction=FindDirection();
              if (direction==27 and this_aspect>1) direction=0;
              Lightup_Direction_Marker();
             }

             restriction=FindLimit();
             switch (restriction) {
                 case 1:
                          if (this_aspect>1) this_aspect=2;
                          this_aspect=this_aspect + 6;                         
                          break;
                 case 2: 
                          if (this_aspect>1) this_aspect=2;
                          switch (Str.ToInt(ST.GetString("HAS_BAR"))) {
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
                 case 3:
                          if (this_aspect>1) this_aspect=2;
                          switch (Str.ToInt(ST.GetString("HAS_BAR"))) {
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
                 default:;               
             }                                                                                             

             if (this_aspect!=memo_aspect)
             {
               NotifySubscribers();
               memo_aspect=this_aspect;
               Lights_Off();
               switch (this_aspect) {
                 case 1:
                  SetFXCoronaTexture("1",galben);
                  break;
                 case 2:
                  SetFXCoronaTexture("2",verde);
                  break;
                 case 3:
                  SetFXCoronaTexture("3",galben);
                  break;
                 case 4:
                  SetFXCoronaTexture("4",galben);
                  break;
                 case 5:
                  SetFXCoronaTexture("5",verde);
                  break;
                 case 6:
                  SetFXCoronaTexture("6",verde);
                  break;
                 case 7:
                  SetFXCoronaTexture("1",galben);
                  SetFXCoronaTexture("7",galben);
                  SetSpeedLimit(30/3.6);
                  break;
                 case 8:
                  SetFXCoronaTexture("2",verde);
                  SetFXCoronaTexture("7",galben);
                  SetSpeedLimit(30/3.6);
                  break;
                 case 9:
                  SetFXCoronaTexture("3",galben);
                  SetFXCoronaTexture("7",galben);
                  SetSpeedLimit(30/3.6);
                  break;
                 case 10:
                  SetFXCoronaTexture("4",galben);
                  SetFXCoronaTexture("7",galben);
                  SetSpeedLimit(30/3.6);
                  break;
                 case 11:
                  SetFXCoronaTexture("5",verde);
                  SetFXCoronaTexture("7",galben);
                  SetSpeedLimit(30/3.6);
                  break;
                 case 12:
                  SetFXCoronaTexture("6",verde);
                  SetFXCoronaTexture("7",galben);
                  SetSpeedLimit(30/3.6);
                  break;
                 case 13:
                  SetFXCoronaTexture("1",galben);
                  SetFXCoronaTexture("7",galben);
                  SetFXCoronaTexture("45",galben);
                  SetFXCoronaTexture("46",galben);
                  SetFXCoronaTexture("47",galben);
                  SetFXCoronaTexture("48",galben);
                  SetSpeedLimit(60/3.6);
                  break;
                 case 14:
                  SetFXCoronaTexture("2",verde);
                  SetFXCoronaTexture("7",galben);
                  SetFXCoronaTexture("45",galben);
                  SetFXCoronaTexture("46",galben);
                  SetFXCoronaTexture("47",galben);
                  SetFXCoronaTexture("48",galben);
                  SetSpeedLimit(60/3.6);
                  break;
                 case 15:
                  SetFXCoronaTexture("3",galben);
                  SetFXCoronaTexture("7",galben);
                  SetFXCoronaTexture("45",galben);
                  SetFXCoronaTexture("46",galben);
                  SetFXCoronaTexture("47",galben);
                  SetFXCoronaTexture("48",galben);
                  SetSpeedLimit(60/3.6);
                  break;
                 case 16:
                  SetFXCoronaTexture("4",galben);
                  SetFXCoronaTexture("7",galben);
                  SetFXCoronaTexture("45",galben);
                  SetFXCoronaTexture("46",galben);
                  SetFXCoronaTexture("47",galben);
                  SetFXCoronaTexture("48",galben);
                  SetSpeedLimit(60/3.6);
                  break;
                 case 17:
                  SetFXCoronaTexture("5",verde);
                  SetFXCoronaTexture("7",galben);
                  SetFXCoronaTexture("45",galben);
                  SetFXCoronaTexture("46",galben);
                  SetFXCoronaTexture("47",galben);
                  SetFXCoronaTexture("48",galben);
                  SetSpeedLimit(60/3.6);
                  break;
                 case 18:
                  SetFXCoronaTexture("6",verde);
                  SetFXCoronaTexture("7",galben);
                  SetFXCoronaTexture("45",galben);
                  SetFXCoronaTexture("46",galben);
                  SetFXCoronaTexture("47",galben);
                  SetFXCoronaTexture("48",galben);
                  SetSpeedLimit(60/3.6);
                  break;
                 case 19:
                  SetFXCoronaTexture("1",galben);
                  SetFXCoronaTexture("7",galben);
                  SetFXCoronaTexture("40",verde);
                  SetFXCoronaTexture("41",verde);
                  SetFXCoronaTexture("42",verde);
                  SetFXCoronaTexture("43",verde);
                  SetSpeedLimit(90/3.6);
                  break;
                 case 20:
                  SetFXCoronaTexture("2",verde);
                  SetFXCoronaTexture("7",galben);
                  SetFXCoronaTexture("40",verde);
                  SetFXCoronaTexture("41",verde);
                  SetFXCoronaTexture("42",verde);
                  SetFXCoronaTexture("43",verde);
                  SetSpeedLimit(90/3.6);
                  break;
                 case 21:
                  SetFXCoronaTexture("3",galben);
                  SetFXCoronaTexture("7",galben);
                  SetFXCoronaTexture("40",verde);
                  SetFXCoronaTexture("41",verde);
                  SetFXCoronaTexture("42",verde);
                  SetFXCoronaTexture("43",verde);
                  SetSpeedLimit(90/3.6);
                  break;
                 case 22:
                  SetFXCoronaTexture("4",galben);
                  SetFXCoronaTexture("7",galben);
                  SetFXCoronaTexture("40",verde);
                  SetFXCoronaTexture("41",verde);
                  SetFXCoronaTexture("42",verde);
                  SetFXCoronaTexture("43",verde);
                  SetSpeedLimit(90/3.6);
                  break;
                 case 23:
                  SetFXCoronaTexture("5",verde);
                  SetFXCoronaTexture("7",galben);
                  SetFXCoronaTexture("40",verde);
                  SetFXCoronaTexture("41",verde);
                  SetFXCoronaTexture("42",verde);
                  SetFXCoronaTexture("43",verde);
                  SetSpeedLimit(90/3.6);
                  break;
                 case 24:
                  SetFXCoronaTexture("6",verde);
                  SetFXCoronaTexture("7",galben);
                  SetFXCoronaTexture("40",verde);
                  SetFXCoronaTexture("41",verde);
                  SetFXCoronaTexture("42",verde);
                  SetFXCoronaTexture("43",verde);
                  SetSpeedLimit(90/3.6);
                  break;
                default:;
               }
             }
           }
           }
    }

   if (Str.ToInt(ST.GetString("SIGNAL_DTV_LINE_BLOCK")))
    {
      if (GetSignalState()==RED) 
         {
           this_aspect=0;
           if (this_aspect!=memo_aspect) {
                                           NotifySubscribers();
                                           memo_aspect=0;
                                           Lights_Off();
                                           SetFXCoronaTexture("0",rosu);
                                         }
         }
      else {
             switch (next_aspect) {
               case 0:
                this_aspect=1;
                break;
               case 1:
                this_aspect=2;
                break;
               case 2:
                this_aspect=2;
                break;
               case 3:
                this_aspect=2;
                break;
               case 4:
                this_aspect=2;
                break;
               case 5:
                this_aspect=2;
                break;
               case 6:
                this_aspect=2;
                break;
               case 7:
                this_aspect=3;
                break;
               case 8:
                this_aspect=3;
                break;
               case 9:
                this_aspect=3;
                break;
               case 10:
                this_aspect=3;
                break;
               case 11:
                this_aspect=3;
                break;
               case 12:
                this_aspect=3;
                break;
               case 13:
                this_aspect=4;
                break;
               case 14:
                this_aspect=4;
                break;
               case 15:
                this_aspect=4;
                break;
               case 16:
                this_aspect=4;
                break;
               case 17:
                this_aspect=4;
                break;
               case 18:
                this_aspect=4;
                break;
               case 19:
                this_aspect=6;
                break;
               case 20:
                this_aspect=6;
                break;
               case 21:
                this_aspect=6;
                break;
               case 22:
                this_aspect=6;
                break;
               case 23:
                this_aspect=6;
                break;
               case 24:
                this_aspect=6;
                break;
               default:;
             }                                                                                               
             if (next_aspect>=100) this_aspect=2;             
             if (this_aspect!=memo_aspect)
             {
               NotifySubscribers(); 
               memo_aspect=this_aspect;
               Lights_Off();
               switch (this_aspect) {
                 case 1:
                  SetFXCoronaTexture("1",galben);
                  break;
                 case 2:
                  SetFXCoronaTexture("2",verde);
                  break;
                 case 3:
                  SetFXCoronaTexture("3",galben);
                  break;
                 case 4:
                  SetFXCoronaTexture("4",galben);
                  break;
                 case 5:
                  SetFXCoronaTexture("5",verde);
                  break;
                 case 6:
                  SetFXCoronaTexture("6",verde);
                  break;
                 default:;
               }
             }
           }
    }

   if (Str.ToInt(ST.GetString("SIGNAL_DTV_DISTANT")))
    {
             switch (next_aspect) {
               case 0:
                this_aspect=1;
                break;
               case 1:
                this_aspect=2;
                break;
               case 2:
                this_aspect=2;
                break;
               case 3:
                this_aspect=2;
                break;
               case 4:
                this_aspect=2;
                break;
               case 5:
                this_aspect=2;
                break;
               case 6:
                this_aspect=2;
                break;
               case 7:
                this_aspect=3;
                break;
               case 8:
                this_aspect=3;
                break;
               case 9:
                this_aspect=3;
                break;
               case 10:
                this_aspect=3;
                break;
               case 11:
                this_aspect=3;
                break;
               case 12:
                this_aspect=3;
                break;
               case 13:
                this_aspect=4;
                break;
               case 14:
                this_aspect=4;
                break;
               case 15:
                this_aspect=4;
                break;
               case 16:
                this_aspect=4;
                break;
               case 17:
                this_aspect=4;
                break;
               case 18:
                this_aspect=4;
                break;
               case 19:
                this_aspect=6;
                break;
               case 20:
                this_aspect=6;
                break;
               case 21:
                this_aspect=6;
                break;
               case 22:
                this_aspect=6;
                break;
               case 23:
                this_aspect=6;
                break;
               case 24:
                this_aspect=6;
                break;
               default:;
             }               
             if (next_aspect>=100) this_aspect=2;                                                                                               
             if (this_aspect!=memo_aspect)
             {
               NotifySubscribers();
               memo_aspect=this_aspect;
               Lights_Off();
               switch (this_aspect) {
                 case 1:
                  SetFXCoronaTexture("1",galben);
                  break;
                 case 2:
                  SetFXCoronaTexture("2",verde);
                  break;
                 case 3:
                  SetFXCoronaTexture("3",galben);
                  break;
                 case 4:
                  SetFXCoronaTexture("4",galben);
                  break;
                 case 5:
                  SetFXCoronaTexture("5",verde);
                  break;
                 case 6:
                  SetFXCoronaTexture("6",verde);
                  break;
                 default:;
               }
             }
    }

   if (Str.ToInt(ST.GetString("SIGNAL_DTV_REPEATER")))
    {
             this_aspect=next_aspect;                                                                              
             if (this_aspect!=memo_aspect)
             {
               memo_aspect=this_aspect;
               NotifySubscribers();
               Lights_Off();
               if (this_aspect==0)
                                   {
                                      SetFXCoronaTexture("50",alb);
                                      SetFXCoronaTexture("51",alb);
                                      SetFXCoronaTexture("52",alb);
                                      SetFXCoronaTexture("53",alb);
                                      SetFXCoronaTexture("57",alb);
                                      SetFXCoronaTexture("58",alb);
                                      SetFXCoronaTexture("59",alb);
                                   }
               if (this_aspect==1 or this_aspect>=3 and this_aspect<=113) 
                                   {
                                      SetFXCoronaTexture("50",alb);
                                      SetFXCoronaTexture("51",alb);
                                      SetFXCoronaTexture("52",alb);
                                      SetFXCoronaTexture("53",alb);
                                      SetFXCoronaTexture("54",alb);
                                      SetFXCoronaTexture("55",alb);
                                      SetFXCoronaTexture("56",alb);
                                   }
               if (this_aspect==2 or this_aspect>=114)
                                   {
                                      SetFXCoronaTexture("50",alb);
                                      SetFXCoronaTexture("51",alb);
                                      SetFXCoronaTexture("52",alb);
                                      SetFXCoronaTexture("53",alb);
                                      SetFXCoronaTexture("60",alb);
                                      SetFXCoronaTexture("61",alb);
                                      SetFXCoronaTexture("62",alb);
                                   }
             }
    }

   if (Str.ToInt(ST.GetString("SIGNAL_DTV_SHUNT")))
    {
      if (!active_shunt and !Str.ToInt(ST.GetString("SIGNAL_DTV_EXITENTRY")))
           {
             this_aspect=next_aspect;
             if (this_aspect!=memo_aspect)
                {
                  memo_aspect=this_aspect;
                  NotifySubscribers();
                  Lights_Off();
                  SetFXCoronaTexture("90",albastru);
                }
           }
      if (active_shunt)
           {
            if (this_aspect!=91)
             {
               this_aspect=91;
               memo_aspect=91;
               NotifySubscribers();
               Lights_Off();
               if (Str.ToInt(ST.GetString("HAS_DIRECTION_MARKER"))) 
                  {
                    direction=0;
                    Lightup_Direction_Marker();
                  }
               SetSpeedLimit(15/3.6);
               SetFXCoronaTexture("91",alb);
             }
           }
    } 
}


 void Update(void) {
   if (use_instruction==1) SignalControl_DTV();
   if (use_instruction==2) SignalControl_DTV2();     
   if (use_instruction==3) SignalControl_TMV();     
 }

 void SignalChange(Message msg) {
  Signal next;

  if (msg.src==me) {
     if (active_nextSignal==null or cast<Semnal>active_nextSignal==null) {
         switch (GetSignalState()) {
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

 void JunctionChange(Message msg) {
  Semnal next_s;

  FindRuleIndex(msg.src);
  if (junction_querry_ok) {
      active_nextSignal=FindSignal();
      if (active_nextSignal) active_nextSignalName=active_nextSignal.GetName();
      if (active_nextSignal==null or cast<Semnal>active_nextSignal==null) {
          switch (GetSignalState()) {
                 case YELLOW: 
                               next_aspect=0;
                               break;
                 case GREEN:
                               next_aspect=1;
                               break;
                 default:;
          }
       }
       else {
               next_s=cast<Semnal>active_nextSignal;
               PostMessage(next_s,"TransmiteStare","",0);
       }
       Update();
  }
 }

 void ShuntEnable(Message msg) {
  if (Str.ToInt(ST.GetString("SIGNAL_DTV_SHUNT")) or Str.ToInt(ST.GetString("SIGNAL_TMV_SHUNT"))) active_shunt=1;
  Update();
 }

 void ShuntDisable(Message msg) {
  if (Str.ToInt(ST.GetString("SIGNAL_DTV_SHUNT")) or Str.ToInt(ST.GetString("SIGNAL_TMV_SHUNT"))) active_shunt=0;
  Update();
 }

 void Notify(Message msg) {
  if (msg.src==active_nextSignal) {
   next_aspect=Str.ToInt(msg.minor);
   Update();
  }
 }

 void Transmit_State(Message msg) {
   NotifySubscribers();
 }

 void SubscribeTo(Signal signl) {
  if (signl!=null and cast<Semnal>signl) PostMessage(signl,"Semnal","Subscribe",0);
 }

 void UnsubscribeFrom(Signal signl) {
  if (signl!=null and cast<Semnal>signl) PostMessage(signl,"Semnal","UnSubscribe",0);
 }

 void Subscribe(Message msg) {
  int i;
  for (i=0; i<subscribers.size(); i++) {
   if (msg.src==subscribers[i]) { return; }
  }
  subscribers[subscribers.size()]=msg.src;
  PostMessage(msg.src,"SchimbareAspect",this_aspect,0);
 }

 void UnSubscribe(Message msg) {
  int i;
  for (i=0; i<subscribers.size(); i++) {
   if (msg.src==subscribers[i]) { 
                                  subscribers[i,i+1]=null;
                                  return;
                                }
  }
 }

 bool Check_Junction_Attack_Angle(Trackside c_from, Junction c_to, bool direct) {
    GSTrackSearch object_tree2;
    MapObject nextobject2,nextnextobject2;
    int junction_pos_memo;

    if (!c_to or !c_from) return false;
    junction_pos_memo=c_to.GetDirection();
    if (c_to.GetDirection()==0) c_to.SetDirection(2);
    else c_to.SetDirection(0);                                                 
    object_tree2=c_from.BeginTrackSearch(direct);
    nextobject2=object_tree2.SearchNext();
    while (1) {
       nextobject2=object_tree2.GetMapObject();
       if (!nextobject2) break;
       nextnextobject2=object_tree2.SearchNext();
       if ((nextobject2==c_to) and (!nextnextobject2)) {
           c_to.SetDirection(junction_pos_memo);
           return true;
       }
    }
    c_to.SetDirection(junction_pos_memo);                        
    return false;
 }

 void Branch_search(Trackside Source, bool relative_facing, bool master_rescan, int route_number) {
    GSTrackSearch object_tree;
    MapObject nextobject,nextnextobject;
    Junction is_junction;
    Signal is_signal;
    int n,k,nr_tmp,route_buffer;
    bool next_facing,master_facing;
    Asset Next_asset;
    StringTable Next_settings;
    Semnal CFR_Signal;

    if (!Source) return; 
    if (master_rescan) {
        relative_facing=true;
        object_tree=me.BeginTrackSearch(true);    
        nextobject=object_tree.SearchNext();
         while (1) {       
                nextobject=object_tree.GetMapObject();
                if (!nextobject) break;
                next_facing=object_tree.GetFacingRelativeToSearchDirection();
                nextnextobject=object_tree.SearchNext();
                if (nextobject==Source) {
                    if (!next_facing) relative_facing = !relative_facing;
                    Branch_search(nextobject,relative_facing,false,route_number);
                    break;
                }
         }
        return;
    }
    master_facing=relative_facing;
    object_tree=Source.BeginTrackSearch(relative_facing);    
    nextobject=object_tree.SearchNext();
    while (1) {
       nextobject=object_tree.GetMapObject();
       if (!nextobject) break;
       next_facing=object_tree.GetFacingRelativeToSearchDirection();
       nextnextobject=object_tree.SearchNext();
       is_signal=cast<Signal>nextobject;
       is_junction=cast<Junction>nextobject;
       if ((is_signal) and (next_facing)) {
           CFR_Signal=cast<Semnal>is_signal;
           if (CFR_Signal) {
               Next_asset=CFR_Signal.GetAsset();
               Next_settings=Next_asset.GetStringTable();    
               if (!Str.ToInt(Next_settings.GetString("SIGNAL_DTV_SHUNT")) and !Str.ToInt(Next_settings.GetString("SIGNAL_TMV_SHUNT"))
                   and !Str.ToInt(Next_settings.GetString("SIGNAL_DTV_REPEATER")) and !Str.ToInt(Next_settings.GetString("SIGNAL_TMV_REPEATER"))) break;
               else if (Str.ToInt(Next_settings.GetString("SIGNAL_DTV_EXITENTRY")) or Str.ToInt(Next_settings.GetString("SIGNAL_TMV_EXITENTRY"))) break;
                    else;
           }
           else break;
       }
       if (is_junction) {
          if (!next_facing) relative_facing = !relative_facing;
          if (rules.size()==0) {
             rules[rules.size()]=new JRule();
             if ((rules[rules.size()-1].slow==0) and (is_tmv)) rules[rules.size()-1].slow=10;
          }
          if (!nextnextobject) {
              if (is_junction.GetDirection()==0) is_junction.SetDirection(2);   
              else is_junction.SetDirection(0);
              n=rules[route_number].njunc.size();
              rules[route_number].njunc[n]=is_junction.GetName();        
              rules[route_number].junc[n]=is_junction;
              rules[route_number].dir[n]=is_junction.GetDirection();
              Branch_search(is_junction,true,true,route_number);  
              break;
          }
          if (Check_Junction_Attack_Angle(Source,is_junction,master_facing)) {
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
          is_junction.SetDirection(0);
          rules[route_number].dir[n]=0;
          Branch_search(is_junction,true,true,route_number);
          route_buffer=route_number;
          route_number=rules.size();
          rules[route_number]=new JRule();
          if ((rules[route_number].slow==0) and (is_tmv)) rules[route_number].slow=10;                                           
          for (k=0;k<=n;k++) {
               nr_tmp=rules[route_number].njunc.size();
               rules[route_number].njunc[nr_tmp]=rules[route_buffer].njunc[k];
               rules[route_number].junc[nr_tmp]=rules[route_buffer].junc[k];
               rules[route_number].dir[nr_tmp]=rules[route_buffer].dir[k];
          }
          is_junction.SetDirection(2);
          rules[route_number].dir[n]=2;
          Branch_search(is_junction,true,true,route_number);
          break;
       }
    }
    return;
 }

  void ROUTE_CONFIG_HELPER(void) {
   int i;

   for (i=rules.size()-1;i>=0;i--) {
      UnsubscribeFrom(rules[i].nextSignal);
      rules[i,i+1]=null;
   }
   Branch_search(me,true,false,0);
 }

 thread void Setup(int mode) {
  int i,j;

  if (mode==1) {
                 for (i=0; i<rules.size(); i++) {
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
                 if (active_nextSignal) active_nextSignalName=active_nextSignal.GetName();
                 Update();
               }
   else {
           for (i=0; i<rules.size(); i++) {
              rules[i].Setup();
              rules[i].nextSignal=cast<Signal>Router.GetGameObject(rules[i].nextSignalName);
              SubscribeTo(rules[i].nextSignal);
              Sleep(1);
           }
           nextSignal=cast<Signal>Router.GetGameObject(nextSignalName);
           SubscribeTo(nextSignal);
           FindRuleIndex(null);
           active_nextSignal=FindSignal();
           if (active_nextSignal) active_nextSignalName=active_nextSignal.GetName();
           Update();          
        }
 }

 void NOTHREADSetup(int mode) {
  int i,j;

  if (mode==1) {
                 for (i=0; i<rules.size(); i++) {
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
                 if (active_nextSignal) active_nextSignalName=active_nextSignal.GetName();
                 Update();
               }
   else {
           for (i=0; i<rules.size(); i++) {
              rules[i].Setup();
              rules[i].nextSignal=cast<Signal>Router.GetGameObject(rules[i].nextSignalName);
              SubscribeTo(rules[i].nextSignal);
           }
           nextSignal=cast<Signal>Router.GetGameObject(nextSignalName);
           SubscribeTo(nextSignal);
           FindRuleIndex(null);
           active_nextSignal=FindSignal();
           if (active_nextSignal) active_nextSignalName=active_nextSignal.GetName();
           Update();          
        }
 }

 string MakeProperty(string link, string text) {
  string t;
  if (text=="") {t=ST.GetString("none"); } else {t=text;}
  return HTMLWindow.MakeLink("live://property/"+link,t);
 }

 string GetRuleHTML(int r) {
  string bgcol=ST.GetString("BGCOLOR");
  string bgcol2=ST.GetString("BGCOLOR2");
  string ret=HTMLWindow.StartTable();
  int j;
  ret=ret+HTMLWindow.MakeRow(
   HTMLWindow.MakeCell("        ")+
   HTMLWindow.MakeCell(ST.GetString("junction"),bgcol)+
   HTMLWindow.MakeCell(ST.GetString("junction.left"),bgcol)+
   HTMLWindow.MakeCell(ST.GetString("junction.forward"),bgcol)+
   HTMLWindow.MakeCell(ST.GetString("junction.right"),bgcol)+
   HTMLWindow.MakeCell(MakeProperty("del-rule/"+r,ST.GetString("del")),bgcol2)
  );
  for(j=0; j<rules[r].njunc.size(); j++) {
   Sleep(10);
   ret=ret+HTMLWindow.MakeRow(
    HTMLWindow.MakeCell("        ")+
    HTMLWindow.MakeCell(MakeProperty("junc/"+r+"/"+j,rules[r].njunc[j]),bgcol2)+
    HTMLWindow.MakeCell(HTMLWindow.RadioButton("live://property/dir/"+r+"/"+j+"/"+Junction.DIRECTION_LEFT,rules[r].dir[j]==Junction.DIRECTION_LEFT),bgcol2)+
    HTMLWindow.MakeCell(HTMLWindow.RadioButton("live://property/dir/"+r+"/"+j+"/"+Junction.DIRECTION_FORWARD,rules[r].dir[j]==Junction.DIRECTION_FORWARD),bgcol2)+
    HTMLWindow.MakeCell(HTMLWindow.RadioButton("live://property/dir/"+r+"/"+j+"/"+Junction.DIRECTION_RIGHT,rules[r].dir[j]==Junction.DIRECTION_RIGHT),bgcol2)+
    HTMLWindow.MakeCell(MakeProperty("del-junc/"+r+"/"+j,ST.GetString("del")),bgcol2)
   );
  }
  ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell("        ")+HTMLWindow.MakeCell(MakeProperty("add-junc/"+r,ST.GetString("junction.add")),bgcol2));
   ret=ret+HTMLWindow.MakeRow(
    HTMLWindow.MakeCell("        ")+
    HTMLWindow.MakeCell("Semnal urmator in abatere: "+rules[r].nextSignalName,bgcol)
   );
   ret=ret+HTMLWindow.MakeRow(
    HTMLWindow.MakeCell("        ")+
    HTMLWindow.MakeCell(MakeProperty("rule-slow/"+r,"<font color=#0525FF>"+ST.GetString("restrictia."+rules[r].slow)+"</font>"),bgcol2)
   );
  if (Str.ToInt(ST.GetString("HAS_DIRECTION_MARKER"))) {
        ret=ret+HTMLWindow.MakeRow(
        HTMLWindow.MakeCell("        ")+
        HTMLWindow.MakeCell(MakeProperty("rule-direction/"+r,"<font color=#40FF00>"+ST.GetString("directia."+rules[r].direction_marker)+"</font>"),bgcol2));
  }
  ret=ret+HTMLWindow.EndTable();
  return ret;
 }

 public string GetDescriptionHTML(void) {
  string ret="<HTML><body>";
  string bgcol=ST.GetString("BGCOLOR");
  string bgcol2=ST.GetString("BGCOLOR2");
  
  
  if ((Str.ToInt(ST.GetString("SIGNAL_DTV_EXITENTRY")) or Str.ToInt(ST.GetString("SIGNAL_TMV_EXITENTRY"))) and (Str.ToInt(ST.GetString("SIGNAL_DTV_SHUNT")) or Str.ToInt(ST.GetString("SIGNAL_TMV_SHUNT"))))
     {
       ret=ret+HTMLWindow.StartTable();
       ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell("Numele Afisat: ",bgcol)+HTMLWindow.MakeCell(MakeProperty("name",thisSignalDisplayName),bgcol2));
       ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell(MakeProperty("one-signal-link","<font color=#A826B3>"+"Leaga Semnalul curent in Schema de semnalizare"+"</font>"),bgcol2));
       ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell(MakeProperty("signal-link","<font color=#A826B3>"+"Reconstituire totala Schema de semnalizare"+"</font>"),bgcol2));
       ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell(MakeProperty("config-help","<font color=#A826B3>"+"Gaseste toate macazele"+"</font>"),bgcol2));
       ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell("Semnal urmator direct: "+nextSignalName,bgcol));
       ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell(MakeProperty("signal-instruction","<font color=#303030>"+ST.GetString("instructia."+use_instruction)+"</font>"),bgcol2));
       ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell("Semnalul da indicatie de manevra",bgcol));
       if (rules.size()==0) {
                              ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell(ST.GetString("rules.none"),bgcol)+HTMLWindow.MakeCell(MakeProperty("add-rule",ST.GetString("rules.add")),bgcol2));
                            } 
       else {
             int r;
             for(r=0; r<rules.size(); r++) {
               Sleep(10);
               ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell(GetRuleHTML(r)));
             }
             ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell(MakeProperty("add-rule",ST.GetString("rules.add")),bgcol2));
            }
       ret=ret+HTMLWindow.EndTable();    
       ret=ret+"</Body></html>";
       return ret;
     }
  if ((Str.ToInt(ST.GetString("SIGNAL_DTV_EXITENTRY")) or Str.ToInt(ST.GetString("SIGNAL_TMV_EXITENTRY"))) and !(Str.ToInt(ST.GetString("SIGNAL_DTV_SHUNT")) or Str.ToInt(ST.GetString("SIGNAL_TMV_SHUNT"))))
     {
       ret=ret+HTMLWindow.StartTable();
       ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell("Numele Afisat: ",bgcol)+HTMLWindow.MakeCell(MakeProperty("name",thisSignalDisplayName),bgcol2));
       ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell(MakeProperty("one-signal-link","<font color=#A826B3>"+"Leaga Semnalul curent in Schema de semnalizare"+"</font>"),bgcol2));
       ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell(MakeProperty("signal-link","<font color=#A826B3>"+"Reconstituire totala Schema de semnalizare"+"</font>"),bgcol2));
       ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell(MakeProperty("config-help","<font color=#A826B3>"+"Gaseste toate macazele"+"</font>"),bgcol2));
       ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell("Semnal urmator direct: "+nextSignalName,bgcol));
       ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell(MakeProperty("signal-instruction","<font color=#303030>"+ST.GetString("instructia."+use_instruction)+"</font>"),bgcol2));
       ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell("Semnalul nu da indicatie de manevra",bgcol));
       if (rules.size()==0) {
                              ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell(ST.GetString("rules.none"),bgcol)+HTMLWindow.MakeCell(MakeProperty("add-rule",ST.GetString("rules.add")),bgcol2));
                            } 
       else {
             int r;
             for(r=0; r<rules.size(); r++) {
               Sleep(10);
               ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell(GetRuleHTML(r)));
             }
             ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell(MakeProperty("add-rule",ST.GetString("rules.add")),bgcol2));
            }
       ret=ret+HTMLWindow.EndTable();    
       ret=ret+"</Body></html>";
       return ret;
     }
  if (!(Str.ToInt(ST.GetString("SIGNAL_DTV_EXITENTRY")) or Str.ToInt(ST.GetString("SIGNAL_TMV_EXITENTRY"))) and (Str.ToInt(ST.GetString("SIGNAL_DTV_SHUNT")) or Str.ToInt(ST.GetString("SIGNAL_TMV_SHUNT"))))
     {
       ret=ret+HTMLWindow.StartTable();
       ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell("Numele Afisat: ",bgcol)+HTMLWindow.MakeCell(MakeProperty("name",thisSignalDisplayName),bgcol2));
       ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell(MakeProperty("one-signal-link","<font color=#A826B3>"+"Leaga Semnalul curent in Schema de semnalizare"+"</font>"),bgcol2));
       ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell(MakeProperty("signal-link","<font color=#A826B3>"+"Reconstituire totala Schema de semnalizare"+"</font>"),bgcol2));
       ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell("Semnalul urmator: "+nextSignalName,bgcol));
       ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell(MakeProperty("signal-instruction","<font color=#303030>"+ST.GetString("instructia."+use_instruction)+"</font>"),bgcol2));  
       ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell("Semnalul de MANEVRA",bgcol));
       ret=ret+HTMLWindow.EndTable();    
       ret=ret+"</Body></html>";
       return ret;
     }
  if (Str.ToInt(ST.GetString("SIGNAL_DTV_LINE_BLOCK")) or Str.ToInt(ST.GetString("SIGNAL_TMV_LINE_BLOCK")))
     {
       ret=ret+HTMLWindow.StartTable();
       ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell("Numele Afisat: ",bgcol)+HTMLWindow.MakeCell(MakeProperty("name",thisSignalDisplayName),bgcol2));
       ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell(MakeProperty("one-signal-link","<font color=#A826B3>"+"Leaga Semnalul curent in Schema de semnalizare"+"</font>"),bgcol2));
       ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell(MakeProperty("signal-link","<font color=#A826B3>"+"Reconstituire totala Schema de semnalizare"+"</font>"),bgcol2));
       ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell("Semnal urmator direct: "+nextSignalName,bgcol));
       ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell(MakeProperty("signal-instruction","<font color=#303030>"+ST.GetString("instructia."+use_instruction)+"</font>"),bgcol2));  
       ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell("Semnalul este BLOC DE LINIE AUTOMAT",bgcol));
       ret=ret+HTMLWindow.EndTable();    
       ret=ret+"</Body></html>";
       return ret;
     }
  if (Str.ToInt(ST.GetString("SIGNAL_DTV_DISTANT")) or Str.ToInt(ST.GetString("SIGNAL_TMV_DISTANT")))
     {
       ret=ret+HTMLWindow.StartTable();
       ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell("Numele Afisat: ",bgcol)+HTMLWindow.MakeCell(MakeProperty("name",thisSignalDisplayName),bgcol2));
       ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell(MakeProperty("one-signal-link","<font color=#A826B3>"+"Leaga Semnalul curent in Schema de semnalizare"+"</font>"),bgcol2));
       ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell(MakeProperty("signal-link","<font color=#A826B3>"+"Reconstituire totala Schema de semnalizare"+"</font>"),bgcol2));
       ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell("Semnal urmator direct: "+nextSignalName,bgcol));
       ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell(MakeProperty("signal-instruction","<font color=#303030>"+ST.GetString("instructia."+use_instruction)+"</font>"),bgcol2));  
       ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell("Semnalul este PREVESTITOR",bgcol));
       ret=ret+HTMLWindow.EndTable();    
       ret=ret+"</Body></html>";
       return ret;
     }
  if (Str.ToInt(ST.GetString("SIGNAL_DTV_REPEATER")) or Str.ToInt(ST.GetString("SIGNAL_TMV_REPEATER")))
     {
       ret=ret+HTMLWindow.StartTable();
       ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell("Numele Afisat: ",bgcol)+HTMLWindow.MakeCell(MakeProperty("name",thisSignalDisplayName),bgcol2));
       ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell(MakeProperty("one-signal-link","<font color=#A826B3>"+"Leaga Semnalul curent in Schema de semnalizare"+"</font>"),bgcol2));
       ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell(MakeProperty("signal-link","<font color=#A826B3>"+"Reconstituire totala Schema de semnalizare"+"</font>"),bgcol2));
       ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell("Semnalul repeta indicatia semnalului: "+nextSignalName,bgcol));
       ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell(MakeProperty("signal-instruction","<font color=#303030>"+ST.GetString("instructia."+use_instruction)+"</font>"),bgcol2));  
       ret=ret+HTMLWindow.MakeRow(HTMLWindow.MakeCell("Semnalul este REPETOR",bgcol));
       ret=ret+HTMLWindow.EndTable();    
       ret=ret+"</Body></html>";
       return ret;
     }
  return ret;
 }

 public string GetPropertyType(string id) {
  string[] tok=Str.Tokens(id,"/");
  if (tok[0]=="rule-direction") { return "list"; }
  else if (tok[0]=="rule-slow") { return "list"; }
  else if (tok[0]=="junc") { return "list,1"; }
  else if (tok[0]=="signal-instruction") { return "list,1"; }
  else if (tok[0]=="name") { return "string,0,8"; }
  return "link";
 }

 public string[] GetPropertyElementList(string id) {
  string[] tok=Str.Tokens(id,"/");
  string[] list=new string[0];

  if (tok[0]=="junc") {
   Junction[] jlist=World.GetJunctionList();
   string[] list=new string[0];
   int i;
   for (i=0; i<jlist.size(); i++) {
    list[i]=jlist[i].GetName();
   }
   return list;
  }
  if (tok[0]=="rule-direction") {
   int i;
   for(i=0;i<=27;i++) {
    list[list.size()]=ST.GetString("directia."+i); 
   }
   return list;
  }
  if (tok[0]=="rule-slow") {
   int i;
   int l,p;
   if (is_dtv)
      {
        l=0;
        p=3;
      }
   if (is_tmv)
      {
        l=4;
        p=10;
      }
   for(i=l;i<=p;i++) {
    list[list.size()]=ST.GetString("restrictia."+i); 
   }
   return list;
  }
  if (tok[0]=="signal-instruction") {
   int i;
   int l,p;
   if (is_dtv)
      {
        l=1;
        p=2;
      }
   if (is_tmv)
      {
        l=3;
        p=3;
      }
   for(i=l;i<=p;i++) {
    list[list.size()]=ST.GetString("instructia."+i); 
   }
   return list;
  }
  return list;
 }

 public void SetPropertyValue(string id, string val) {
  string[] tok=Str.Tokens(id,"/");
  
  if (tok[0]=="rule-direction") {
   int r=Str.ToInt(tok[1]);
   int i;   
   for(i=0;i<=27;i++) {
    if (val==ST.GetString("directia."+i)) { rules[r].direction_marker=i; }
   }
   Update();
  }
  if (tok[0]=="rule-slow") {
   int r=Str.ToInt(tok[1]);
   int i;
   int l,p;
   if (is_dtv)
      {
        l=0;
        p=3;
      }
   if (is_tmv)
      {
        l=4;
        p=10;
      }
   for(i=l;i<=p;i++) {
    if (val==ST.GetString("restrictia."+i)) { rules[r].slow=i; }
   }
   Update();
  }
  if (tok[0]=="signal-instruction") {
   int i;
   int l,p;
   if (is_dtv)
      {
        l=1;
        p=2;
      }
   if (is_tmv)
      {
        l=3;
        p=3;
      }
   for(i=l;i<=p;i++) {
    if (val==ST.GetString("instructia."+i)) { use_instruction=i; }
   }
   Update();
  }
  if (tok[0]=="junc") {
   int r=Str.ToInt(tok[1]);
   int j=Str.ToInt(tok[2]);
   rules[r].njunc[j]=val;
   rules[r].junc[j]=cast<Junction>Router.GetGameObject(val);
   UnsubscribeFrom(rules[r].nextSignal);
   Update();
  }
  if (tok[0]=="name") {
    thisSignalDisplayName=val;
    SetFXNameText("name0"," ");
    SetFXNameText("name1"," ");
    if (thisSignalDisplayName!="") { 
                                     string[] tok=Str.Tokens(thisSignalDisplayName," ");
                                     SetFXNameText("name0",tok[0]);
                                     if (tok.size()>=2) SetFXNameText("name1",tok[1]);
                                   }
  }
 }

 public void SetPropertyValue(string id, string val, int idx) {
  SetPropertyValue(id,val);
 }

 public void LinkPropertyValue(string id) {
  int k;
  Signal [] SignalList = new Signal[0];
  Semnal ASLink;
  string[] tok=Str.Tokens(id,"/");
   
  if (tok[0]=="add-rule") {
   rules[rules.size()]=new JRule();
   if ((rules[rules.size()-1].slow==0) and (is_tmv)) rules[rules.size()-1].slow=10;
  }
  if (tok[0]=="add-junc") {
   int r=Str.ToInt(tok[1]);
   int n=rules[r].njunc.size();
   rules[r].njunc[n]="";
   rules[r].junc[n]=null;
   rules[r].dir[n]=Junction.DIRECTION_NONE;
  }
  if (tok[0]=="del-rule") {
   int r=Str.ToInt(tok[1]);
   rules[r,r+1]=null;
  }
  if (tok[0]=="del-junc") {
   int r=Str.ToInt(tok[1]);
   int j=Str.ToInt(tok[2]);
   rules[r].junc[j,j+1]=null;
   rules[r].njunc[j,j+1]=null;
   rules[r].dir[j,j+1]=null;
   UnsubscribeFrom(rules[r].nextSignal);
  }
  if (tok[0]=="dir") {
   int r=Str.ToInt(tok[1]);
   int j=Str.ToInt(tok[2]);
   int d=Str.ToInt(tok[3]);
   rules[r].dir[j]=d;
   UnsubscribeFrom(rules[r].nextSignal);
  }
  if (tok[0]=="one-signal-link") {
    NOTHREADSetup(1);
  }
  if (tok[0]=="signal-link") {
    SignalList=World.GetSignalList();
    for(k=SignalList.size()-1;k>=0;k--) {
       ASLink=cast<Semnal>SignalList[k];
       if (ASLink) ASLink.Setup(1);
       SignalList[k,k+1]=null;
    }
    NOTHREADSetup(1);
  }
  if (tok[0]=="config-help") {
     ROUTE_CONFIG_HELPER();
  }
 }

 public string GetPropertyName(string id) {
  string[] tok=Str.Tokens(id,"/");
  
  if (tok[0]=="rule-direction") { return ST.GetString("selectdir"); }
  else if (tok[0]=="junc") { return ST.GetString("junction"); }
       else if (tok[0]=="name") { return ST.GetString("selectname"); }
            else if (tok[0]=="rule-slow") { return ST.GetString("selectrestrictie"); }
                 else if (tok[0]=="signal-instruction") { return ST.GetString("selectinstruct"); }      
  return "";
 }
 
 public string GetPropertyDescription(string id) {
  return "";
 }

 public Soup GetProperties(void) {
  Soup sig=inherited();
  sig.SetNamedTag("NextSignalName",nextSignalName);
  sig.SetNamedTag("DisplayedName",thisSignalDisplayName);
  sig.SetNamedTag("Instruction",use_instruction);
  sig.SetNamedTag("rules.num",rules.size());
  int i;
  for (i=0; i<rules.size(); i++) {
   sig.SetNamedSoup("rule."+i,rules[i].GetProperties());
  }
  return sig;
 }

 public void SetProperties(Soup sig) {
  int default_instr;

  nextSignalName=sig.GetNamedTag("NextSignalName");
  thisSignalDisplayName=sig.GetNamedTag("DisplayedName");
   if (is_dtv)
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
  for (i=0; i<n; i++) {
   rules[i]=new JRule();
   rules[i].SetProperties(sig.GetNamedSoup("rule."+i));
   if (rules[i].slow==0 and is_tmv) rules[i].slow=10;
  }
  Setup(2);
  SetFXNameText("name0"," ");
  SetFXNameText("name1"," ");
  if (thisSignalDisplayName!="") { 
                                   string[] tok=Str.Tokens(thisSignalDisplayName," ");
                                   SetFXNameText("name0",tok[0]);
                                   if (tok.size()>=2) SetFXNameText("name1",tok[1]);
                                 }
 }

 public void Init(void) {
  inherited();
  Asset self=GetAsset();
  ST=self.GetStringTable();
  rosu=self.FindAsset("Red");
  galben=self.FindAsset("Yellow");
  verde=self.FindAsset("Green");
  alb=self.FindAsset("White");
  albastru=self.FindAsset("Blue");
  if (verde==null or galben==null or rosu==null or alb==null or albastru==null) {
   Interface.Log("Error:Corona Loading Failed!");
   return;
  }

  if (Str.ToInt(ST.GetString("SIGNAL_DTV_EXITENTRY")) or Str.ToInt(ST.GetString("SIGNAL_DTV_LINE_BLOCK")) or Str.ToInt(ST.GetString("SIGNAL_DTV_DISTANT")) or Str.ToInt(ST.GetString("SIGNAL_DTV_SHUNT")) or Str.ToInt(ST.GetString("SIGNAL_DTV_REPEATER")))
     {
       is_dtv=1;
       is_tmv=0;
     }
  if (Str.ToInt(ST.GetString("SIGNAL_TMV_EXITENTRY")) or Str.ToInt(ST.GetString("SIGNAL_TMV_LINE_BLOCK")) or Str.ToInt(ST.GetString("SIGNAL_TMV_DISTANT")) or Str.ToInt(ST.GetString("SIGNAL_TMV_SHUNT")) or Str.ToInt(ST.GetString("SIGNAL_TMV_REPEATER")))
     {
       is_dtv=0;
       is_tmv=1;
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
  if (Str.ToInt(ST.GetString("HAS_DIRECTION_MARKER"))) {
     direction=0;
     Lightup_Direction_Marker();
  }
  
  AddHandler(me,"SchimbareAspect","","Notify");
  AddHandler(me,"TransmiteStare","","Transmit_State");
  AddHandler(me,"ActivManevra","","ShuntEnable");
  AddHandler(me,"DezactivManevra","","ShuntDisable");
  AddHandler(me,"Signal","StateChanged","SignalChange");
  AddHandler(me,"Junction","Toggled","JunctionChange");
  AddHandler(me,"Semnal","Subscribe","Subscribe");
  AddHandler(me,"Semnal","UnSubscribe","UnSubscribe");
 }

};