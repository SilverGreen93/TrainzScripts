
include "DriverCommand.gs"
include "World.gs"

class ComandaAvarie isclass DriverCommand
{

	DriverCharacter drv;	//memoreaza global mecanicul curent
	
	public void Init(Asset asset)
	{
		inherited(asset);
		AddHandler(me, "MesajAvarie", null, "HandlerAvarie");  
	}
   
   
	public void AddCommandMenuItem(DriverCharacter driver, Menu menu)
	{
		StringTable strTable = GetAsset().GetStringTable();
		Menu itemMenu0 = Constructors.NewMenu();
		Train train;
		
		drv = driver;	//memoreaza global mecanicul curent
		
		if (driver) {
			train = driver.GetTrain();
		}
		
		if (train or !driver) {
			itemMenu0.AddItem(strTable.GetString("man_0"), me, "MesajAvarie", "0");
			itemMenu0.AddItem(strTable.GetString("man_1"), me, "MesajAvarie", "1");
			itemMenu0.AddItem(strTable.GetString("man_2"), me, "MesajAvarie", "2");
			menu.AddSubmenu(strTable.GetString("main_menu_format"), itemMenu0);
		}
	}

	void HandlerAvarie(Message msg)
	{
		int Avarie = Str.ToInt((string)msg.minor);
		Train train;
		int i=0;
		StringTable ST = GetAsset().GetStringTable();
		
		if (drv) {	//daca exista mecanic
			train = drv.GetTrain();	//memoreaza trenul curent
		}
		
		if (Avarie == 0 and train)	//Avarie permisa local
		{
			MapObject[] objects;

			objects	= train.TrackSearch(true,Str.ToInt(ST.GetString("dist")));	//cauta toate obiectele de pe sina la distanta maxima specificata
			
			while (i < objects.size())	//trimite la toate obiectele
			{
				PostMessage(objects[i],"ActivAvarie","",0.0);
				i++;
			}
			
			objects = train.TrackSearch(false,Str.ToInt(ST.GetString("dist")));	//cauta toate obiectele de pe sina la distanta maxima specificata
			i=0;
			while (i < objects.size())	//trimite la toate obiectele
			{
				PostMessage(objects[i],"ActivAvarie","",0.0);
				i++;
			}

		}
		
		if (Avarie == 1)	//Avarie permisa global
			PostMessage(null,"ActivAvarie","",0.0);
			
		if (Avarie == 2)	//Avarie nepermisa global
			PostMessage(null,"DezactivAvarie","",0.0);
	}
	
};

