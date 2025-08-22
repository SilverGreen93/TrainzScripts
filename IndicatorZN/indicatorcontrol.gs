//
// Script for controlling the RO CFR Indicator Disjunctor from Session Rules
// Version: 3.2.250822
// Author: SilverGreen93 (c) 2013-2025
// GitHub: https://github.com/SilverGreen93/TrainzScripts
// Forum: https://www.tapatalk.com/groups/vvmm/
//

include "ScenarioBehavior.gs"
include "World.gs"
include "Browser.gs"
include "Signal.gs"
include "indicatorzn.gs"


class IndicatorControl isclass ScenarioBehavior
{
    define bool DEBUG = true;
    public string BUILD = "v3.2.250822";

    // By default no indicator is selected. Default indicator state is automatic.
    string indicatorName = "";
    int indicatorState = 0;
    int totalStates = 0;


    // Restore properties
    public void SetProperties(Soup soup)
    {
        inherited(soup);
        indicatorName = soup.GetNamedTag("indicatorName");
        indicatorState = soup.GetNamedTagAsInt("indicatorState", 0);
        totalStates = soup.GetNamedTagAsInt("totalStates", 0);
    }


    // Save properties
    public Soup GetProperties(void)
    {
        Soup soup = inherited();

        soup.SetNamedTag("indicatorName", indicatorName);
        soup.SetNamedTag("indicatorState", indicatorState);
        soup.SetNamedTag("totalStates", totalStates);

        return soup;
    }


    // Get the HTML for this rule
    public string GetDescriptionHTML(void)
    {
        StringTable strTable = GetAsset().GetStringTable();

        string output = "<html><body><p><font color=#FFFFFF size=10>RO CFR Indicator Disjunctor Control </font><font color=#FFFFFF size=3>" +
                        BUILD + "</font></p><br><br>";

        if (indicatorName == "")
        {
            output = output + "<a href=live://property/indicator_name>" + strTable.GetString("info_indicator") + "</a>";
        }
        else
        {
            output = output + "Set indicator <a href=live://property/indicator_name>" +
                     indicatorName + "</a> aspect as <a href=live://property/state/>";

            output = output + strTable.GetString("state_" + indicatorState) + "</a>";
        }

        output = output + "</body></html>";

        return output;
    }


    // Get the property name for a specific property ID
    string GetPropertyName(string propertyID)
    {
        StringTable strTable = GetAsset().GetStringTable();

        if (propertyID == "indicator_name")
            return strTable.GetString("info_indicator");
        else if (propertyID[0, 6] == "state/")
            return strTable.GetString("info_aspect");

        return "<null>";
    }


    // Get the property displayed value for a specific property ID
    public string GetPropertyValue(string propertyID)
    {
        if (propertyID == "indicator_name")
            return indicatorName;

        return "<null>";
    }

    // Get the property description for a specific property ID
    string GetPropertyDescription(string propertyID)
    {
        StringTable strTable = GetAsset().GetStringTable();

        if (propertyID == "indicator_name")
            return strTable.GetString("info_indicator");
        else if (propertyID[0, 6] == "state/")
            return strTable.GetString("info_aspect");

        return "<null>";
    }


    // Get the property type for a specific property ID
    string GetPropertyType(string propertyID)
    {
        if (propertyID == "indicator_name")
            return "string";
        else if (propertyID[0, 6] == "state/")
            return "list";

        return "link";
    }


    // Get option index from aspect text
    void SetPropertyValue(string propertyID, string value)
    {
        StringTable strTable = GetAsset().GetStringTable();

        if (propertyID == "indicator_name")
        {
            indicatorName = value;
        }
        else if (propertyID[0, 6] == "state/")
        {
            int optIdx = 0, dir;
            string listItem;

            listItem = strTable.GetString("state_" + optIdx);
            while (listItem != "")
            {
                if (value == strTable.GetString("state_" + optIdx))
                {
                    // found the correct option, set the index
                    indicatorState = optIdx;
                    return;
                }

                optIdx++;
                listItem = strTable.GetString("state_" + optIdx);
            }

            indicatorState = 0;
        }
    }


    // Get the state list to display to the user
    public string[] GetPropertyElementList(string propertyID)
    {
        StringTable strTable = GetAsset().GetStringTable();
        string[] ret = new string[0];

        if (propertyID[0, 6] == "state/")
        {
            int optIdx = 0;
            int dir;
            string listItem;

            listItem = strTable.GetString("state_" + optIdx);
            while (listItem != "")
            {
                ret[optIdx] = listItem;
                optIdx++;
                listItem = strTable.GetString("state_" + optIdx);
            }
        }

        return ret;
    }


    // Set the indicator according to the selected state
    void SetIndicatorNow(void)
    {
        MapObject thisIndicator;

        if (indicatorName != "") {
            thisIndicator = cast<MapObject>(Router.GetGameObject(indicatorName));
            if (thisIndicator) {
                if (DEBUG)
                    Interface.Log("CTRL-RO-CFR-DBG> Will post indicatorState " + indicatorState);

                switch (indicatorState) {
                    case 0: // Nu deconecta disjunctorul
                        thisIndicator.PostMessage(thisIndicator, "Indicator", "aspect/" + IndicatorZN.S_DJ_NU_DECON, 0.0);
                        break;
                    case 1: // Deconectează disjunctorul
                        thisIndicator.PostMessage(thisIndicator, "Indicator", "aspect/" + IndicatorZN.S_DJ_DECON, 0.0);
                        break;
                    default:
                        Interface.Log("CTRL-RO-CFR-ERR> indicatorState unknown: " + indicatorState);
                        break;
                }
            }
        }
        SetComplete(true);
    }


    public void Pause(bool paused)
    {
        if (paused == IsPaused())
            return;

        SetStateFlags(PAUSED, paused);

        if ((!paused) and (!IsComplete()))
            SetIndicatorNow();
    }


    // Get an icon style for a childs relationship to its parent
    public string GetChildRelationshipIcon(ScenarioBehavior child)
    {
        // This rule does not support children, return none
        return "none";
    }
};
