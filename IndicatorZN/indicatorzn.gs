//
// RO CFR Indicator Zona Neutra Script Library
// Version: 3.2.250821
// Author: SilverGreen93 (c) 2013-2025
// GitHub: https://github.com/SilverGreen93/TrainzScripts
// Forum: https://www.tapatalk.com/groups/vvmm/
//

include "trackside.gs"

class IndicatorZN isclass Trackside
{
    public define int S_DJ_DECON = 0; // Ü aspect
    public define int S_DJ_NU_DECON = 1; // I aspect

    string indicator_type;
    public int aspect = S_DJ_DECON;
    Asset bec;


    //
    // Change aspect
    //
    public void UpdateAspect()
    {
        if (indicator_type == "TMV")
        {
            if (aspect == S_DJ_NU_DECON)
            {
                SetFXAttachment(26, bec);
                SetFXAttachment(27, bec);
            }
            else
            {
                SetFXAttachment(26, null);
                SetFXAttachment(27, null);
            }
        }
        else
        {
            if (aspect == S_DJ_NU_DECON)
            {
                SetMeshVisible("conn", true, 0);
                SetMeshVisible("decon", false, 0);
            }
            else
            {
                SetMeshVisible("conn", false, 0);
                SetMeshVisible("decon", true, 0);
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
        sp.SetNamedTag("aspect", aspect);
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
        HTMLWindow hw = HTMLWindow;
        string s = "<p><font size=15>Indicator Zonă Neutră RO CFR</font></p><br>";

        s = s + hw.MakeTable(hw.MakeRow(
                    hw.MakeCell("Nu deconecta disjunctorul ", "bgcolor=#D0B040")+
                    hw.MakeCell(hw.CheckBox("live://property/aspect", aspect),"bgcolor=#B0B0B0")
                ), "border=1 cellspacing=1");
        return s;
    }


    public string GetDescriptionHTML(void)
    {
        string str;
        str = "<html><body>";
        str = str + GetContent();
        str = str + "</body></html>";
        return str;
    }


    public void SetPropertyValue(string id, int val)
    {
        if (id == "aspect")
        {
            aspect = Str.ToInt(val);
            UpdateAspect();
        }
    }


    public void LinkPropertyValue(string id)
    {
        // Toggle checkbox
        if (id == "aspect")
        {
            aspect = !aspect;
            UpdateAspect();
        }
    }


    //
    // Message Handler for all IndicatorZN messages
    //
    void MessageHandler(Message msg)
    {
        if (msg.major == "Indicator")
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

        Soup extensions = GetAsset().GetConfigSoup().GetNamedSoup("extensions");

        indicator_type = extensions.GetNamedTag("indicator_type-474195");
        bec = GetAsset().FindAsset("bec");

        AddHandler(me, "Indicator", "", "MessageHandler");
    }
};