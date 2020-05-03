//
// ControlSemnal pentru controlul semnalelor RO CFR
//

include "ScenarioBehavior.gs"
include "World.gs"
include "Browser.gs"
include "Signal.gs"


class ControlSemnal isclass ScenarioBehavior
{
	public string BUILD = "v3.0 b160321";

  // By default no signal is selected.  Default signal state is automatic.
  string signalName = "";
  int signalState = 0;

  void SetSignalNow(void);

  //
  // PropertyObject methods
  // 

  public void SetProperties(Soup soup)
  {
    inherited(soup);
    signalName = soup.GetNamedTag("signalName");
    signalState = soup.GetNamedTagAsInt("signalState", 0);

  }


  public void Pause(bool paused)
  {
    if (paused == IsPaused())
      return;
    
    SetStateFlags(PAUSED, paused);

    if ((!paused) and (!IsComplete()))
      SetSignalNow();
  }


  public Soup GetProperties(void)
  {
    Soup soup = inherited();

    soup.SetNamedTag("signalName", signalName);
    soup.SetNamedTag("signalState", signalState);

    return soup;
  }


  public string GetDescriptionHTML(void)
  {
    StringTable strTable = GetAsset().GetStringTable();

    string output = "<html><body><p><font color=#FFFFFF size=10>Control 
			Semnal RO CFR </font><font color=#FFFFFF size=3>" + BUILD + 
			"</font></p><br><br>";

    if (signalName == "")
    {
      output = output + "<a href=live://property/signal/>Alege Semnal</a>";
    }
    else
    {
      output = output + "Seteaza semnalul <a href=live://property/signal/>" +
                signalName + "</a> pe modul <a href=live://property/state/>";

      output = output + strTable.GetString("state" + signalState);

      output = output + "</a>";
    }

	output = output + "<br><br><p>Atentie! Pentru a aparea in lista, semnalele trebuie sa aiba nume configurat!</p>";
	
    output = output + "</body></html>";
    return output;
  }


  string GetPropertyName(string propertyID)
  {
    StringTable strTable = GetAsset().GetStringTable();
  
    if (propertyID[0, 7] == "signal/")
      return "Alege semnal";

    if (propertyID[0, 6] == "state/")
      return "Alege modul";

    return "<null>";
  }


  string GetPropertyDescription(string propertyID)
  {
    StringTable strTable = GetAsset().GetStringTable();

    if (propertyID[0, 7] == "signal/")
      return "Alege semnal";

    if (propertyID[0, 6] == "state/")
      return "Alege modul";

    return "<null>";
  }


  string GetPropertyType(string propertyID)
  {
    if (propertyID[0, 7] == "signal/")
      return "list";

    if (propertyID[0, 6] == "state/")
      return "list";

    return "link";
  }


  void SetPropertyValue(string propertyID, string value)
  {
    StringTable strTable = GetAsset().GetStringTable();
  
    if (propertyID[0, 7] == "signal/")
    {
      signalName = value;
    }

    if (propertyID[0, 6] == "state/")
    {
		int i;
		signalState = 0;
		for (i = 0; i < Str.ToInt(strTable.GetString("state_no")); ++i)
			if (value == strTable.GetString("state" + i))
				signalState = i;

	}
  }

  public string[] GetPropertyElementList(string propertyID)
  {
    StringTable strTable = GetAsset().GetStringTable();
    string[] ret = new string[0];
    
    if (propertyID[0, 7] == "signal/")
    {
      Signal[] signals = World.GetSignalList();
    
      int i, out = 0;
      for (i = 0; i < signals.size(); i++)
      {
        if (signals[i])
        {
          string name = signals[i].GetLocalisedName();

          if (name and name.size())
            ret[out++] = name;
        }
      }
    }

    if (propertyID[0, 6] == "state/")
    {
		int out=0, i;
		for (i = 0; i < Str.ToInt(strTable.GetString("state_no")); ++i)
			ret[out++] = strTable.GetString("state" + i);
    }

    return ret;
  }


  // Set the signal according to the selected state
  void SetSignalNow()
  {
	Signal thisSignal;

	if (signalName != "") {
		thisSignal = cast<Signal>(Router.GetGameObject(signalName));
		if (thisSignal) {
			switch (signalState) {
				case (0) : // Automat
					thisSignal.PostMessage(thisSignal, "Semnal", "aspect/0", 0.0);
					break;
				case (1) : // Manevra
					thisSignal.PostMessage(thisSignal, "Semnal", "aspect/91", 0.0);
					break;
				case (2) : // Chemare
					thisSignal.PostMessage(thisSignal, "Semnal", "aspect/92", 0.0);
					break;
				case (3) : // Avarie
					thisSignal.PostMessage(thisSignal, "Semnal", "aspect/70", 0.0);
					break;
				case (4) : // Impinge convoiul pe cocoasa
					thisSignal.PostMessage(thisSignal, "Semnal", "aspect/92", 0.0);
					break;
				case (5) : // Trage convoiul de pe cocoasa
					thisSignal.PostMessage(thisSignal, "Semnal", "aspect/71", 0.0);
					break;
				default:
					break;
			}
			if (signalState > 5)
			{ // Directie
				signalState = signalState - 5;
				thisSignal.PostMessage(thisSignal, "Semnal", "directie/" + signalState, 0.0);
			}
		}
	}
    SetComplete(true);
  }


  //=============================================================================
  // Name: GetChildRelationshipIcon
  // Desc: Get an icon style for a childs relationship to its parent
  //=============================================================================
  public string GetChildRelationshipIcon(ScenarioBehavior child)
  {
    // This rule does not support children, return none
    return "none";
  }

};
