//
// Script for controlling the RO CFR Signaling System from Session Rules
// Version: 3.2.250822
// Author: SilverGreen93 (c) 2013-2025
// GitHub: https://github.com/SilverGreen93/TrainzScripts
// Forum: https://www.tapatalk.com/groups/vvmm/
//

include "ScenarioBehavior.gs"
include "World.gs"
include "Browser.gs"
include "Signal.gs"
include "semnal_cfr.gs"


class SemnalControl isclass ScenarioBehavior
{
    define bool DEBUG = true;
    public string BUILD = "v3.2.250822";

    // By default no signal is selected. Default signal state is automatic.
    string signalName = "";
    int signalState = 0;
    int totalStates = 0;


    // Restore properties
    public void SetProperties(Soup soup)
    {
        inherited(soup);
        signalName = soup.GetNamedTag("signalName");
        signalState = soup.GetNamedTagAsInt("signalState", 0);
        totalStates = soup.GetNamedTagAsInt("totalStates", 0);
    }


    // Save properties
    public Soup GetProperties(void)
    {
        Soup soup = inherited();

        soup.SetNamedTag("signalName", signalName);
        soup.SetNamedTag("signalState", signalState);
        soup.SetNamedTag("totalStates", totalStates);

        return soup;
    }


    // Get the HTML for this rule
    public string GetDescriptionHTML(void)
    {
        StringTable strTable = GetAsset().GetStringTable();

        string output = "<html><body><p><font color=#FFFFFF size=10>RO CFR Signal Control </font><font color=#FFFFFF size=3>" +
                        BUILD + "</font></p><br><br>";

        if (signalName == "")
        {
            output = output + "<a href=live://property/signal/>" + strTable.GetString("info_signal") + "</a>";
        }
        else
        {
            output = output + "Set signal <a href=live://property/signal/>" +
                     signalName + "</a> aspect as <a href=live://property/state/>";
            if (signalState > totalStates)
            {
                output = output + strTable.GetString("direction_" + (signalState - totalStates)) + "</a>";
            }
            else
            {
                output = output + strTable.GetString("state_" + signalState) + "</a>";
            }
        }

        output = output + "</body></html>";

        return output;
    }


    // Get the property name for a specific property ID
    string GetPropertyName(string propertyID)
    {
        StringTable strTable = GetAsset().GetStringTable();

        if (propertyID[0, 7] == "signal/")
            return strTable.GetString("info_signal");
        else if (propertyID[0, 6] == "state/")
            return strTable.GetString("info_aspect");

        return "<null>";
    }


    // Get the property description for a specific property ID
    string GetPropertyDescription(string propertyID)
    {
        StringTable strTable = GetAsset().GetStringTable();

        if (propertyID[0, 7] == "signal/")
            return strTable.GetString("info_signal");
        else if (propertyID[0, 6] == "state/")
            return strTable.GetString("info_aspect");

        return "<null>";
    }


    // Get the property type for a specific property ID
    string GetPropertyType(string propertyID)
    {
        if (propertyID[0, 7] == "signal/")
            return "list";
        else if (propertyID[0, 6] == "state/")
            return "list";

        return "link";
    }


    // Get option index from aspect text
    void SetPropertyValue(string propertyID, string value)
    {
        StringTable strTable = GetAsset().GetStringTable();
    
        if (propertyID[0, 7] == "signal/")
        {
            signalName = value;
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
                    signalState = optIdx;
                    return;
                }

                optIdx++;
                listItem = strTable.GetString("state_" + optIdx);
            }

            optIdx--;

            // search directions
            for (dir = 1; dir <= 27; dir++)
            {
                if (value == strTable.GetString("direction_" + dir))
                {
                    // found the correct option, set the index
                    signalState = optIdx + dir;
                    return;
                }
            }

            signalState = 0;
        }
    }


    // Get the signal list or state list to display to the user
    public string[] GetPropertyElementList(string propertyID)
    {
        StringTable strTable = GetAsset().GetStringTable();
        string[] ret = new string[0];

        if (propertyID[0, 7] == "signal/")
        {
            Signal[] signals = World.GetSignalList();

            int i, optIdx = 0;
            for (i = 0; i < signals.size(); i++)
            {
                if (signals[i])
                {
                    string name = signals[i].GetLocalisedName();

                    if (name and name.size())
                    {
                        ret[optIdx] = name;
                        optIdx++;
                    }
                }
            }
        }
        else if (propertyID[0, 6] == "state/")
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

            totalStates = optIdx - 1;

            // add directions
            for (dir = 1; dir <= 27; dir++)
            {
                ret[optIdx] = strTable.GetString("direction_" + dir);
                optIdx++;
            }
        }

        return ret;
    }


    // Set the signal according to the selected state
    void SetSignalNow(void)
    {
        Signal thisSignal;

        if (signalName != "") {
            thisSignal = cast<Signal>(Router.GetGameObject(signalName));
            if (thisSignal) {
                if (DEBUG)
                    Interface.Log("CTRL-RO-CFR-DBG> Will post signalState " + signalState);

                if (signalState > totalStates)
                { // Directie
                    thisSignal.PostMessage(thisSignal, "Semnal", "directie/" + (signalState - totalStates), 0.0);
                }
                else
                {
                    switch (signalState) {
                        case 0: // Automat
                            thisSignal.PostMessage(thisSignal, "Semnal", "aspect/" + Signal.AUTOMATIC, 0.0);
                            break;
                        case 1: // Manevra permisă
                            thisSignal.PostMessage(thisSignal, "Semnal", "aspect/" + Semnal.S_ALB, 0.0);
                            break;
                        case 2: // Chemare
                            thisSignal.PostMessage(thisSignal, "Semnal", "aspect/" + Semnal.S_ALB_CL, 0.0);
                            break;
                        case 3: // Avarie
                            thisSignal.PostMessage(thisSignal, "Semnal", "aspect/" + Semnal.S_ROSU, 0.0);
                            break;
                        case 4: // Trierea oprită
                            thisSignal.PostMessage(thisSignal, "Semnal", "aspect/" + Semnal.S_ROSU, 0.0);
                            break;
                        case 5: // Împinge încet convoiul
                            thisSignal.PostMessage(thisSignal, "Semnal", "aspect/" + Semnal.S_GALBEN, 0.0);
                            break;
                        case 6: // Împinge mai repede convoiul
                            thisSignal.PostMessage(thisSignal, "Semnal", "aspect/" + Semnal.S_VERDE, 0.0);
                            break;
                        case 7: // Împinge pînă la vîrf
                            thisSignal.PostMessage(thisSignal, "Semnal", "aspect/" + Semnal.S_ALB_CL, 0.0);
                            break;
                        case 8: // Trage convoiul înapoi
                            thisSignal.PostMessage(thisSignal, "Semnal", "aspect/" + Semnal.S_ROSU_CL, 0.0);
                            break;
                        default:
                            Interface.Log("CTRL-RO-CFR-ERR> signalState unknown: " + signalState);
                            break;
                    }
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
            SetSignalNow();
    }


    // Get an icon style for a childs relationship to its parent
    public string GetChildRelationshipIcon(ScenarioBehavior child)
    {
        // This rule does not support children, return none
        return "none";
    }
};
