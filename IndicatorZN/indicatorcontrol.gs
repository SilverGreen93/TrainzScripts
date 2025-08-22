
include "ScenarioBehavior.gs"
include "World.gs"
include "Browser.gs"
include "common.gs"
include "Library.gs"




class ControlDisj isclass ScenarioBehavior
{
	StringTable stringTable;
	int m_state = 0;

	public void Disj (int m);

  public void Init(Asset self)
  {
    inherited(self);

    stringTable = self.GetStringTable();
  }


	//
	// ScenarioBehavior methods
	//

	// Pause/unpause this rule.
	public void Pause(bool paused)
	{
		if (paused == IsPaused())
			return;

		SetStateFlags(PAUSED, paused);

		if (!paused)
		{
			switch (m_state)
			{
				case 0:
					Disj(0);
					break;
				case 1:
					Disj(1);
					break;
				case 2:
					Disj(2);
					break;
				default:
					break;
			}
		}
	}

	public void Disj (int m)
	{
		Train train;
		int i=0, j=0;
		StringTable ST = GetAsset().GetStringTable();
		
		if (m == 0)	//Disj permisa local
		{
			MapObject[] objects;
			DriverCharacter[] drivers;
			
			drivers = World.GetDriverCharacterList() ; 
		while (j<drivers.size())	//aprinde manevrele pentru toti driverii
		{
			if (drivers[j]) {	//daca exista mecanic
				train = drivers[j].GetTrain();	//memoreaza trenul curent
			}
			
			if (train)
			{
			
			objects	= train.TrackSearch(true,Str.ToInt(ST.GetString("dist")));	//cauta toate obiectele de pe sina la distanta maxima specificata
			
			while (i < objects.size())	//trimite la toate obiectele
			{
				PostMessage(objects[i],"DisjConn","",0.0);
				i++;
			}
			
			objects = train.TrackSearch(false,Str.ToInt(ST.GetString("dist")));	//cauta toate obiectele de pe sina la distanta maxima specificata
			i=0;
			while (i < objects.size())	//trimite la toate obiectele
			{
				PostMessage(objects[i],"DisjConn","",0.0);
				i++;
			}
			}
			j++;
		}
		
		}
			
			
			if (m == 1)	//Disj permisa global
			{	
				PostMessage(null,"DisjConn","",0.0);	//trimite mesaj catre scriptul de semnal pentru a activa Disj
			}
			
			if (m == 2)
			{
				PostMessage(null,"DisjDecon","",0.0);	//trimite mesaj catre scriptul de semnal pentru a dezactiva Disj
			}
	
	}


	public Soup GetProperties(void)
	{
		Soup soup = inherited();

		soup.SetNamedTag("ControlDisj.m_state", m_state);

		return soup;
	}


	public void SetProperties(Soup soup)
	{
		inherited(soup);
		
		m_state = soup.GetNamedTagAsInt("ControlDisj.m_state", 0);
	}


  //
	// Returns HTML description.
  //
	public string GetDescriptionHTML(void)
	{
		string body = "<html><body><font color=#000000>";

		body = body + "<p>" + stringTable.GetString("html_description") + "</p>";

		body = body + "<p>" + HTMLWindow.RadioButton("live://property/mp", m_state == 0)
			+ stringTable.GetString("m_0") + "</p>";
			
		body = body + "<p>" + HTMLWindow.RadioButton("live://property/mpg", m_state == 1)
			+ stringTable.GetString("m_1") + "</p>";
			
		body = body + "<p>" + HTMLWindow.RadioButton("live://property/mi", m_state == 2)
			+ stringTable.GetString("m_2") + "</p>";
		
		body = body + "</font></body></html>";

	  return body;
	}


	//
	string GetPropertyType(string propertyID)
	{
		return "link";
	}

	void LinkPropertyValue(string propertyID)
	{
		if (propertyID == "mp")
			m_state = 0;

		if (propertyID == "mpg")
			m_state = 1;
			
		if (propertyID == "mi")
			m_state = 2;
	}
};