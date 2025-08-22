//
// RO CFR Signals Script (Zona Neutra)
// Version: 3.0
// Build: 160321
// Date: 21.03.2016 
// Author: vvmm (c) 2013-2016
// Website: http://vvmm.freeforums.org/
// 

include "trackside.gs"

class IndicatorZN isclass Trackside
{
	string signal_type;
	public int aspect = 98; //daca e afisat 99=I sau 98=U
	Asset bec;
	
	define int S_DJ_DECON = 98;
	define int S_DJ_CON = 99;
	
	//
	// Schimba aspectul
	//
	public void UpdateAspect()
	{
		if (signal_type == "TMV")
		{
			if (aspect == 99)
			{
				SetFXAttachment(26,bec);
				SetFXAttachment(27,bec);
			}
			else
			{
				SetFXAttachment(26,null);
				SetFXAttachment(27,null);
			}
		}
		else
		{
			if (aspect == 99)
			{
				SetMeshVisible("conn",true,0);
				SetMeshVisible("decon",false,0);
			}
			else
			{
				SetMeshVisible("conn",false,0);
				SetMeshVisible("decon",true,0);
			}
		}
	}
	
	public string GetPropertyDescription(string id)
	{
		return "";
	}
	
	public string GetPropertyName(string id)
	{
		return "";
	}
	
	public string GetPropertyType(string id)
	{
		return "link";
	}
	
	public Soup GetProperties(void)
	{
		Soup sp = inherited();
		sp.SetNamedTag("aspect",aspect); 
		return sp;
	}

	public void SetProperties(Soup db)
	{
		inherited(db); 
		aspect = db.GetNamedTagAsInt("aspect");
		UpdateAspect();
	}

	public string GetContent(void)
	{
		HTMLWindow hw=HTMLWindow;
		string s= "<p><font size=15>Semnal RO CFR</font></p><br>";

		s=s+hw.MakeTable(
			hw.MakeRow(
				hw.MakeCell("Nu deconecta disjunctorul ","bgcolor=#D0B040")+
				hw.MakeCell(hw.CheckBox("live://property/aspect",aspect),"bgcolor=#B0B0B0")
			)
		,"border=1 cellspacing=1");
		return s;
	}

	public string GetDescriptionHTML(void)
	{
		string str;
		str="<html><body>";
		str=str+GetContent();
		str=str+"</body></html>";
		return str;
	}
	
	public void SetPropertyValue(string id,int val)
	{
		if (id=="aspect")
		{
			aspect=Str.ToInt(val);
			UpdateAspect();
		}
	}

	public void LinkPropertyValue(string id)
	{
		// Daca am modificat CheckBox-ul
		if (id=="aspect")
		{
			aspect=!aspect;
			UpdateAspect();
		}
	}
	
	//
	// Message Handler for all Semnal messages
	//
	void MessageHandler(Message msg)
	{
		if (msg.major == "Semnal")
		{	
			string[] tok = Str.Tokens(msg.minor, "/");
			
			if (tok[0] == "aspect")
			{
				aspect = Str.ToInt(tok[1]);
				UpdateAspect();
			}
		}
	}
	
	public void Init(Asset asset)
	{
		inherited(asset);
		
		Asset self = GetAsset();
		Soup config = self.GetConfigSoup();
		Soup extensions = config.GetNamedSoup("extensions");
		
		signal_type = extensions.GetNamedTag("signal_type-474195");  
		bec = GetAsset().FindAsset("bec");
		
		AddHandler(me, "Semnal", "", "MessageHandler");	
	}
	
};