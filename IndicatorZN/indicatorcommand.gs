
include "DriverCommand.gs"
include "World.gs"

class ComandaDisj isclass DriverCommand
{

	DriverCharacter drv;	//memoreaza global mecanicul curent
	
	public void Init(Asset asset)
	{
		inherited(asset);
		AddHandler(me, "MesajDisj", null, "HandlerDisj");  
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
			itemMenu0.AddItem(strTable.GetString("man_0"), me, "MesajDisj", "0");
			itemMenu0.AddItem(strTable.GetString("man_1"), me, "MesajDisj", "1");
			itemMenu0.AddItem(strTable.GetString("man_2"), me, "MesajDisj", "2");
			menu.AddSubmenu(strTable.GetString("main_menu_format"), itemMenu0);
		}
	}

	void HandlerDisj(Message msg)
	{
		int Disj = Str.ToInt((string)msg.minor);
		Train train;
		int i=0;
		StringTable ST = GetAsset().GetStringTable();
		
		if (drv) {	//daca exista mecanic
			train = drv.GetTrain();	//memoreaza trenul curent
		}
		
		if (Disj == 0 and train)	//Disj permisa local
		{
			MapObject[] objects;

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
		
		if (Disj == 1)	//Disj permisa global
			PostMessage(null,"DisjConn","",0.0);
			
		if (Disj == 2)	//Disj nepermisa global
			PostMessage(null,"DisjDecon","",0.0);
	}
	
};

