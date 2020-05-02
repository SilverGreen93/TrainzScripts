//
// Light up a bulb gradually
// Version: 1.1
// Date: 31.01.2016
// Author: vvmm (c) 2013-2016
// Website: http://vvmm.freeforums.org/
//

include "MapObject.gs"

class Bec isclass MapObject
{
	float lightDelay;
	
	void Aprindere()
	{
		SetMeshVisible("default", false, 0);
		SetMeshVisible("default", true, lightDelay);
	}
	
	public void Init(void)
	{
		inherited();
		lightDelay = GetAsset().GetConfigSoup().GetNamedSoup("extensions").GetNamedTagAsFloat("lightdelay-474195", 0.3);
		Aprindere();
	}
};