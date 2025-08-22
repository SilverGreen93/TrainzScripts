//
// Script for controlling the RO CFR Signaling System from driver commands
// Version: 2.0.250821
// Author: SilverGreen93 (c) 2013-2025
// GitHub: https://github.com/SilverGreen93/TrainzScripts
// Forum: https://www.tapatalk.com/groups/vvmm/
//

include "drivercommand.gs"
include "world.gs"
include "semnal_cfr.gs"

class SemnalCommand isclass DriverCommand
{
    define bool DEBUG = true;

    DriverCharacter drv; // current driver
    string minor_msg; // message for the signal type
    string signal_tag; // if the signal is of the right type
    string class_type; // type of script (triere, dtv, disjunctor)


    // Find and send the message to the next signal to change its aspect
    void MessageNextSemnal(Train train, int aspect, bool direction)
    {
        Vehicle frontVehicle = train.GetVehicles()[0];
        GSTrackSearch GSTS = frontVehicle.BeginTrackSearch(frontVehicle.GetDirectionRelativeToTrain() == direction);
        MapObject mo = GSTS.SearchNext();

        while (mo)
        {
            // if the signal is of the right type and is in the right direction and is of the right type
            if (cast<Semnal>mo and GSTS.GetFacingRelativeToSearchDirection() and
                mo.GetAsset().GetConfigSoup().GetNamedSoup("extensions").GetNamedTagAsBool(signal_tag, false))
            {
                PostMessage(mo, "Semnal", minor_msg + "/" + aspect, 0.0);
                if (DEBUG)
                    Interface.Log("CMD-RO-CFR-DBG> Posted message to " + mo.GetLocalisedName() + " with " + minor_msg + "/" + aspect);
                return; // exit after finding the first signal that matches
            }

            mo = GSTS.SearchNext();
        }
    }


    void HandlerComandaTriere(Train train, int optIndex)
    {
        switch (optIndex)
        {
            case 0:
                // Trierea oprită
                MessageNextSemnal(train, Semnal.S_ROSU, true);
                break;
            case 1:
                // Împinge încet convoiul
                MessageNextSemnal(train, Semnal.S_GALBEN, true);
                break;
            case 2:
                // Împinge mai repede convoiul
                MessageNextSemnal(train, Semnal.S_VERDE, true);
                break;
            case 3:
                // Împinge pînă la vîrf
                MessageNextSemnal(train, Semnal.S_ALB_CL, true);
                break;
            case 4:
                // Trage convoiul înapoi
                MessageNextSemnal(train, Semnal.S_ROSU_CL, true);
                break;
            case 5:
                // Manevra permisă
                MessageNextSemnal(train, Semnal.S_ALB, true);
                break;
            case 6:
                // Automat (global)
                PostMessage(null, "Semnal", minor_msg + "/" + Signal.AUTOMATIC, 0.0);
                if (DEBUG)
                    Interface.Log("CMD-RO-CFR-DBG> Posted global message with " + minor_msg + "/" + Signal.AUTOMATIC);
                break;
            default:
                Interface.Log("CMD-RO-CFR-ERR> Invalid option index: " + optIndex);
                break;
        }
    }


    void HandlerComandaDTV(Train train, int optIndex)
    {
        switch (optIndex)
        {
            case 0:
                // Actiune restrictiva
                if (class_type == "manevra")
                {
                    MessageNextSemnal(train, Semnal.S_ALB, true);
                }
                else if (class_type == "chemare")
                {
                    MessageNextSemnal(train, Semnal.S_ALB_CL, true);
                }
                else if (class_type == "avarie")
                {
                    MessageNextSemnal(train, Semnal.S_ROSU, true);
                }
                else
                {
                    Interface.Log("CMD-RO-CFR-ERR> Invalid class_type: " + class_type);
                }
                break;
            case 1:
                // Automat (global)
                PostMessage(null, "Semnal", minor_msg + "/" + Signal.AUTOMATIC, 0.0);
                if (DEBUG)
                    Interface.Log("CMD-RO-CFR-DBG> Posted global message with " + minor_msg + "/" + Signal.AUTOMATIC);
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

        if (class_type == "triere")
        {
            HandlerComandaTriere(train, optIndex);
        }
        else
        {
            HandlerComandaDTV(train, optIndex);
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
            itemMenu.AddItem(menuItem, me, "ComandaSemnal", optIdx);
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
        signal_tag = extensions.GetNamedTag("signal_tag-474195");
        class_type = extensions.GetNamedTag("class_type-474195");

        AddHandler(me, "ComandaSemnal", null, "HandlerComanda");
    }
};

