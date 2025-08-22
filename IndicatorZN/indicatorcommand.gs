//
// Script for controlling the RO CFR Indicator Disjunctor from driver commands
// Version: 2.0.250822
// Author: SilverGreen93 (c) 2013-2025
// GitHub: https://github.com/SilverGreen93/TrainzScripts
// Forum: https://www.tapatalk.com/groups/vvmm/
//

include "drivercommand.gs"
include "world.gs"
include "indicatorzn.gs"

class IndicatorCommand isclass DriverCommand
{
    define bool DEBUG = true;

    DriverCharacter drv; // current driver
    string minor_msg; // message for the indicator type
    string indicator_tag; // if the indicator is of the right type
    string class_type; // type of script (ZN)


    // Find and send the message to the next indicator to change its aspect
    void MessageNextIndicator(Train train, int aspect, bool direction)
    {
        Vehicle frontVehicle = train.GetVehicles()[0];
        GSTrackSearch GSTS = frontVehicle.BeginTrackSearch(frontVehicle.GetDirectionRelativeToTrain() == direction);
        MapObject mo = GSTS.SearchNext();

        while (mo)
        {
            // if the indicator is of the right type and is in the right direction and is of the right type
            if (cast<IndicatorZN>mo and GSTS.GetFacingRelativeToSearchDirection() and
                mo.GetAsset().GetConfigSoup().GetNamedSoup("extensions").GetNamedTag(indicator_tag) == "ZN")
            {
                PostMessage(mo, "Indicator", minor_msg + "/" + aspect, 0.0);
                if (DEBUG)
                    Interface.Log("CMD-RO-CFR-DBG> Posted message to " + mo.GetLocalisedName() + " with " + minor_msg + "/" + aspect);
                return; // exit after finding the first indicator that matches
            }

            mo = GSTS.SearchNext();
        }
    }


    void HandlerComandaZN(Train train, int optIndex)
    {
        switch (optIndex)
        {
            case 0: // Nu deconecta disjunctorul
                MessageNextIndicator(train, IndicatorZN.S_DJ_NU_DECON, true);
                break;
            case 1: // Deconectează disjunctorul (global)
                PostMessage(null, "Indicator", minor_msg + "/" + IndicatorZN.S_DJ_DECON, 0.0);
                if (DEBUG)
                    Interface.Log("CMD-RO-CFR-DBG> Posted global message with " + minor_msg + "/" + IndicatorZN.S_DJ_DECON);
                break;
            default:
                Interface.Log("CMD-RO-CFR-ERR> Invalid option index: " + optIndex);
                break;
        }
    }


    void HandlerComanda(Message msg)
    {
        Train train;
        int optIndex = Str.ToInt((string)msg.minor);

        if (DEBUG)
            Interface.Log("CMD-RO-CFR-DBG> User selected option " + optIndex);

        if (drv) {
            train = drv.GetTrain(); // store the current train
            if (!train) {
                Interface.Log("CMD-RO-CFR-ERR> There is no train for driver: " + drv.GetLocalisedName());
                return;
            }
        }

        if (DEBUG)
            Interface.Log("CMD-RO-CFR-DBG> Train is: " + train.GetTrainDisplayName());

        if (class_type == "ZN")
        {
            HandlerComandaZN(train, optIndex);
        }
        else
        {
            Interface.Log("CMD-RO-CFR-ERR> Unknown class_type: " + class_type);
        }
    }


    // Add the Driver command menu items
    public void AddCommandMenuItem(DriverCharacter driver, Menu menu)
    {
        StringTable strTable = GetAsset().GetStringTable();
        Menu itemMenu = Constructors.NewMenu();
        int optIdx = 0;
        string menuItem;

        drv = driver; // store the current driver
        if (!drv) {
            Interface.Log("CMD-RO-CFR-ERR> There is no driver!");
            return;
        }

        menuItem = strTable.GetString("opt_" + optIdx);
        while (menuItem != "")
        {
            itemMenu.AddItem(menuItem, me, "ComandaIndicator", optIdx);
            optIdx++;
            menuItem = strTable.GetString("opt_" + optIdx);
        }

        menu.AddSubmenu(strTable.GetString("main_menu_format"), itemMenu);
    }


    public void Init(Asset asset)
    {
        inherited(asset);
        Soup extensions = GetAsset().GetConfigSoup().GetNamedSoup("extensions");

        minor_msg = extensions.GetNamedTag("minor_msg-474195");
        indicator_tag = extensions.GetNamedTag("indicator_tag-474195");
        class_type = extensions.GetNamedTag("class_type-474195");

        AddHandler(me, "ComandaIndicator", null, "HandlerComanda");
    }
};
