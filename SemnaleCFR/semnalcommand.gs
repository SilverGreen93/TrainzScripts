//
// Script for controlling the RO CFR Signaling System from driver commands
// Author: SilverGreen93 (c) 2013-2025
// Email: mihai.vasiliu.93@gmail.com
// MyTrainz ID: vvmm (474195)
// Website: https://www.tapatalk.com/groups/vvmm/
//

include "drivercommand.gs"
include "world.gs"
include "semnal_cfr.gs"

class SemnalCommand isclass DriverCommand
{
    define bool DEBUG = false;

    DriverCharacter drv; // memoreaza global mecanicul curent
    int aspect_auto_msg; // mesaj pentru aspect automat/liber
    int aspect_restrict_msg; // mesaj pentru aspect restrictionat
    string minor_msg; // mesaj pentru tipul de semnal
    string signal_tag; // daca semnalul este de tipul potrivit

    public void Init(Asset asset)
    {
        inherited(asset);
        Asset self = GetAsset();
        Soup config = self.GetConfigSoup();
        Soup extensions = config.GetNamedSoup("extensions");

        minor_msg = extensions.GetNamedTag("minor_msg-474195");
        aspect_auto_msg = extensions.GetNamedTagAsInt("aspect_auto_msg-474195");
        aspect_restrict_msg = extensions.GetNamedTagAsInt("aspect_restrict_msg-474195");
        signal_tag = extensions.GetNamedTag("signal_tag-474195");

        AddHandler(me, "ComandaSemnal", null, "HandlerComanda");
    }

    public void AddCommandMenuItem(DriverCharacter driver, Menu menu)
    {
        StringTable strTable = GetAsset().GetStringTable();
        Menu itemMenu = Constructors.NewMenu();
        int optIdx;

        drv = driver; // memoreaza global mecanicul curent
        if (!drv) {
            Interface.Log("CMD-RO-CFR-ERR> There is no driver!");
            return;
        }

        if (DEBUG)
            Interface.Log("CMD-RO-CFR-DBG> Driver is: " + driver.GetLocalisedName());

        for (optIdx = 0; optIdx < 6; optIdx++) {
            itemMenu.AddItem(strTable.GetString("opt_" + optIdx), me, "ComandaSemnal", optIdx);
        }

        menu.AddSubmenu(strTable.GetString("main_menu_format"), itemMenu);
    }

    // Gasește și trimite mesajul către următorul semnal pentru a schimba aspectul
    void MessageNextSemnal(Train train, int aspect, bool direction)
    {
        Vehicle frontVehicle = train.GetVehicles()[0];
        GSTrackSearch GSTS = frontVehicle.BeginTrackSearch(frontVehicle.GetDirectionRelativeToTrain() == direction);
        MapObject mo = GSTS.SearchNext();

        while (mo)
        {
            // daca semnalul este de tipul potrivit si se afla in directia cautata si este de tipul potrivit
            if (cast<Semnal>mo and GSTS.GetFacingRelativeToSearchDirection() and
                mo.GetAsset().GetConfigSoup().GetNamedSoup("extensions").GetNamedTagAsInt(signal_tag, 0) == 1)
            {
                PostMessage(mo, "Semnal", minor_msg + "/" + aspect, 0.0);
                if (DEBUG)
                    Interface.Log("CMD-RO-CFR-DBG> Posted message to " + mo.GetLocalisedName() + " with " + minor_msg + "/" + aspect);
                return; // ieșim după ce am găsit primul semnal
            }

            mo = GSTS.SearchNext();
        }
    }

    void HandlerComanda(Message msg)
    {
        int optIndex = Str.ToInt((string)msg.minor);
        Train train;

        if (DEBUG)
            Interface.Log("CMD-RO-CFR-DBG> User selected option " + optIndex);

        // optiunile globale
        if (optIndex == 2)
        {
            PostMessage(null, "Semnal", minor_msg + "/" + aspect_restrict_msg, 0.0);
            if (DEBUG)
                Interface.Log("CMD-RO-CFR-DBG> Posted global message with " + minor_msg + "/" + aspect_restrict_msg);
            return;
        }
        else if (optIndex == 5)
        {
            PostMessage(null, "Semnal", minor_msg + "/" + aspect_auto_msg, 0.0);
            if (DEBUG)
                Interface.Log("CMD-RO-CFR-DBG> Posted global message with " + minor_msg + "/" + aspect_auto_msg);
            return;
        }

        if (drv) { // daca exista mecanic
            train = drv.GetTrain(); // memoreaza trenul curent
            if (!train) {
                Interface.Log("CMD-RO-CFR-ERR> There is no train for driver: " + drv.GetLocalisedName());
                return;
            }
        }

        if (DEBUG)
            Interface.Log("CMD-RO-CFR-DBG> Train is: " + train.GetTrainDisplayName());

        switch (optIndex)
        {
            case 0:
                MessageNextSemnal(train, aspect_restrict_msg, true);
                break;
            case 1:
                MessageNextSemnal(train, aspect_restrict_msg, false);
                break;
            case 3:
                MessageNextSemnal(train, aspect_auto_msg, true);
                break;
            case 4:
                MessageNextSemnal(train, aspect_auto_msg, false);
                break;
            default:
                Interface.Log("CMD-RO-CFR-ERR> Invalid option index: " + optIndex);
                break;
        }
    }
};

