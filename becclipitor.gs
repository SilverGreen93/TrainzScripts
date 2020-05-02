//
// Blink a bulb gradually
// Version: 1.1
// Date: 31.01.2016
// Author: vvmm (c) 2013-2016
// Website: http://vvmm.freeforums.org/
//

include "MapObject.gs"

class BecClipitor isclass MapObject
{
	public StringTable ST;
	public float freq = 1;
	float adj = 0.1; // Ajustarea clipirii cu dT intre stingere/aprindere
	
	thread void Clipire(void)
	{
		while(1)
		{
			// Sleep-ul trebuie sa astepte tot atata cat ii ia mesh-ului sa apara sau sa dispara
			Sleep(1/freq/2 + adj);
			SetMeshVisible("default", true, 1/freq/2 - adj);
			Sleep(1/freq/2 + adj);
			SetMeshVisible("default", false, 1/freq/2 - adj);
		}
	}

	public void Init(void)
	{
		inherited();
		freq = GetAsset().GetConfigSoup().GetNamedSoup("extensions").GetNamedTagAsFloat("lightfreq-474195", 0.8);
		Clipire();
	}
};