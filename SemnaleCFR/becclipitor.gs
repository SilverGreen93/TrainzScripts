//
// Blinking Incandescent Signal Bulb
// Version: 2.0.250821
// Author: SilverGreen93 (c) 2013-2025
// GitHub: https://github.com/SilverGreen93/TrainzScripts
// Forum: https://www.tapatalk.com/groups/vvmm/
//

include "meshobject.gs"

class BecClipitor isclass MeshObject
{
    define float adj = 0.1; // Sleep-Blink delay adjust


    // Light bulb without blinking
    void Aprindere(float delay)
    {
        SetMeshVisible("default", true, delay);
    }


    // Light bulb and blink
    thread void Clipire(float freq)
    {
        float period = 1 / freq / 2;

        while(1)
        {
            // Sleep must wait the same amount of time as it takes for the mesh to appear or disappear
            SetMeshVisible("default", true, period - adj);
            Sleep(period + adj);
            SetMeshVisible("default", false, period - adj);
            Sleep(period + adj);
        }
    }


    public void Init(Asset asset)
    {
        float delay; // Initial turn on delay
        float freq; // Blinking frequency

        inherited(asset);

        delay = GetAsset().GetConfigSoup().GetNamedSoup("extensions").GetNamedTagAsFloat("lightdelay-474195", 0);
        freq = GetAsset().GetConfigSoup().GetNamedSoup("extensions").GetNamedTagAsFloat("lightfreq-474195", 0);

        SetMeshVisible("default", false, 0);

        if (freq > 0)
        {
            Clipire(freq);
        }
        else
        {
            Aprindere(delay);
        }
    }
};