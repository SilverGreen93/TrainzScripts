//
// RO CFR Signal Script Library
// Version: 3.2.250821
// Author: SilverGreen93 (c) 2013-2025
// GitHub: https://github.com/SilverGreen93/TrainzScripts
// Forum: https://www.tapatalk.com/groups/vvmm/
//

include "signal.gs"
include "junction.gs"
include "HTMLbuffer.gs"

class SigLib isclass Library{};

class Semnal isclass Signal
{
    define string BUILD = "v3.2.250821";
    define bool DEBUG = true;

    // Definitiile becurilor (efectelor din config)
    define string B_ROSU = "0";
    define string B_GALBEN = "1";
    define string B_VERDE = "2";
    define string B_GAL_JOS = "3";
    define string B_LINIE = "80";
    define string B_ROSU_AV = "70";
    define string B_ALBASTRU = "90";
    define string B_ALB = "91";
    define string B_CHEMARE = "92";

    // Definitiile aspectelor semnalelor
    define public int S_NOMEMO = -2; // nu are un aspect memorat inca
    define public int S_ROSU = 0;
    define public int S_GALBEN = 1;
    define public int S_VERDE = 2;
    define public int S_GAL_CL = 3;
    define public int S_GAL_DCL = 4;
    define public int S_VER_CL = 6;
    define public int S_GAL_GAL = 7;
    define public int S_VER_GAL = 8;
    define public int S_GAL_GAL_60 = 13;
    define public int S_VER_GAL_60 = 14;
    define public int S_GAL_GAL_90 = 19;
    define public int S_VER_GAL_90 = 20;
    define public int S_ROSU_CL = 83;
    define public int S_ALBASTRU = 90;
    define public int S_ALB = 91;
    define public int S_ALB_CL = 92;
    define public int S_BLOC_INVERS = 93;
    define int T_GALBEN = 100;
    define int T_GALBEN_20 = 101;
    define int T_GALBEN_30 = 102;
    define int T_GALBEN_60 = 103;
    define int T_GALBEN_80 = 104;
    define int T_GALBEN_90 = 105;
    define int T_GALBEN_100 = 106;
    define int T_VER_CL = 107;
    define int T_VER_CL_20 = 108;
    define int T_VER_CL_30 = 109;
    define int T_VER_CL_60 = 110;
    define int T_VER_CL_80 = 111;
    define int T_VER_CL_90 = 112;
    define int T_VER_CL_100 = 113;
    define int T_VERDE = 114;
    define int T_VERDE_20 = 115;
    define int T_VERDE_30 = 116;
    define int T_VERDE_60 = 117;
    define int T_VERDE_80 = 118;
    define int T_VERDE_90 = 119;
    define int T_VERDE_100 = 120;

    // Definitiile restrictiilor de viteza
    define int R_NOMEMO = -2; // nu are o restrictie memorata inca
    define int R_UNDEF = -1; // nu are o restrictie setata inca
    define int R_VS = 0;
    define int R_30 = 1;
    define int R_60 = 2;
    define int R_90 = 3;
    define int R_T20 = 4;
    define int R_T30 = 5;
    define int R_T60 = 6;
    define int R_T80 = 7;
    define int R_T90 = 8;
    define int R_T100 = 9;
    define int R_TVS = 10;
    define int R_MANEVRA = 91;
    define int R_CHEMARE = 92;

    // Definitiile pentru index legaturi semnale
    define int LINK_NEXT = 0; // semnalul urmator
    define int LINK_PREV = 1; // semnalul precedent

    // variabile locale
    string signal_type;
    string html_title;

    int has_bar, has_direction, lights_count;
    Asset rosu, galben, verde, alb, albastru, albmic, galbenmic, verdemic;
    Asset verdeclipitor, galbenclipitor, albclipitor, rosuclipitor, alblinie;
    Asset galbenclipitor2, Letters;
    Soup config;

    GameObjectID[] junctionIDList = new GameObjectID[0];
    Signal[] linkSignal = new Signal[2]; // 0 - semnalul urmator, 1 - semnalul precedent

    int next_aspect = AUTOMATIC;
    int next_restrict = R_UNDEF;
    int memo_aspect = S_NOMEMO; // pentru a evita situatia in care this_aspect==memo_aspect la initializare, de exemplu albastru manevra
    int memo_restrict = R_NOMEMO;
    bool xxx; // semnal scos din uz
    int special_restrict = AUTOMATIC; // aspect special comandat
    int direction, restriction, ies_st, linie;
    bool bla_left = false; // dacă semnalul BLA trebuie să respecte orientarea de bloc pe linia din stînga a căii duble
    bool orientare_bla = true; // dacă semnalul BLA are orientarea de bloc activată în funcție de sosirea trenului
    string numeAfisat;

    // variabile publice
    public int this_aspect = AUTOMATIC;
    public bool is_iesire, is_intrare, is_bla, is_bla4i, is_prevestitor, is_pitic;
    public bool is_repetitor, is_manevra, is_avarie, is_triere, is_chemare, is_grup;

    //
    // Returneaza distanta pana la semnalul urmator
    //
    string DistantaSemnal(void)
    {
        GSTrackSearch GSTS = BeginTrackSearch(true);
        MapObject mo = GSTS.SearchNext();
        string dist = "does not exist";
        while (mo)
        {
            if (cast<Semnal>mo and GSTS.GetFacingRelativeToSearchDirection())
            {
                dist = (int)GSTS.GetDistance() + "m";
                break;
            }

            mo = GSTS.SearchNext();
        }
        return dist;
    }

    //
    // Returneaza distanta pana la macazul urmator
    //
    string DistantaMacaz(void)
    {
        GSTrackSearch GSTS = BeginTrackSearch(true);
        MapObject mo = GSTS.SearchNext();
        string dist = "does not exist";
        while (mo)
        {
            if (cast<Junction>mo)
            {
                dist = (int)GSTS.GetDistance() + "m";
                break;
            }

            mo = GSTS.SearchNext();
        }
        return dist;
    }

    //
    // Light up the line indicator
    //
    void LightLinie(int k)
    {
        if (!is_grup or signal_type != "TMV")
            return;

        GetFXAttachment("ln").SetFXTextureReplacement("cifra", Letters, 14 + k);
    }

    //
    // Light up the left exit indicator
    //
    void LightStanga(int ies_st)
    {
        if (has_direction == 1)
        {
            if (signal_type == "TMV")
            {
                GetFXAttachment("ies_st").SetFXTextureReplacement("cifra", Letters, 30 - ies_st);
            }
            else
                if (ies_st)
                    SetFXAttachment(B_LINIE, alblinie);
                else
                    SetFXAttachment(B_LINIE, null);
        }
        else if (has_direction == 2)
        {
            if (ies_st == 0)
            {
                GetFXAttachment("ies_st0").SetFXTextureReplacement("cifra", Letters, 30);
                GetFXAttachment("ies_st1").SetFXTextureReplacement("cifra", Letters, 30);
            }
            else
            {
                GetFXAttachment("ies_st" + direction % 2).SetFXTextureReplacement("cifra", Letters, 29);
                GetFXAttachment("ies_st" + (direction + 1) % 2).SetFXTextureReplacement("cifra", Letters, 30);
            }
        }
        else
            if (ies_st)
                SetFXAttachment(B_LINIE, alblinie);
            else
                SetFXAttachment(B_LINIE, null);
    }

    //
    // Light up the direction indicator
    //
    void LightDirection(int direction)
    {
        if (!has_direction)
            return;

        if (signal_type == "TMV")
        {
            if (has_direction == 2)
            {
                if (direction == 0)
                {
                    GetFXAttachment("d0").SetFXTextureReplacement("cifra", Letters, 30);
                    GetFXAttachment("d1").SetFXTextureReplacement("cifra", Letters, 30);
                }
                else
                {
                    GetFXAttachment("d" + direction % 2).SetFXTextureReplacement("cifra", Letters, 30 + direction);
                    GetFXAttachment("d" + (direction + 1) % 2).SetFXTextureReplacement("cifra", Letters, 30);
                }
            }
            else
                GetFXAttachment("d").SetFXTextureReplacement("cifra", Letters, 30 + direction);

            return;
        }

        int k;

        // Turn off all lights
        for(k = 100; k <= 134; ++k)
            SetFXAttachment("" + k, null);

        // Light up the corresponding letter
        switch (direction)
        {
            case 1: //A
                for(k=130;k>=110;k=k-5) SetFXAttachment("" + k, albmic);
                for(k=106;k>=102;k=k-4) SetFXAttachment("" + k, albmic);
                for(k=108;k<=114;k=k+6) SetFXAttachment("" + k, albmic);
                for(k=119;k<=134;k=k+5) SetFXAttachment("" + k, albmic);
                for(k=121;k<=123;k=k+1) SetFXAttachment("" + k, albmic);
                break;
            case 2: //B
                for(k=130;k>=100;k=k-5) SetFXAttachment("" + k, albmic);
                for(k=101;k<=103;k=k+1) SetFXAttachment("" + k, albmic);
                for(k=109;k<=109;k=k+6) SetFXAttachment("" + k, albmic);
                for(k=114;k<=118;k=k+4) SetFXAttachment("" + k, albmic);
                for(k=124;k<=124;k=k+6) SetFXAttachment("" + k, albmic);
                for(k=129;k<=133;k=k+4) SetFXAttachment("" + k, albmic);
                for(k=132;k>=131;k=k-1) SetFXAttachment("" + k, albmic);
                for(k=117;k>=116;k=k-1) SetFXAttachment("" + k, albmic);
                break;
            case 3:
                for(k=125;k>=105;k=k-5) SetFXAttachment("" + k, albmic);
                for(k=101;k<=103;k=k+1) SetFXAttachment("" + k, albmic);
                for(k=109;k<=109;k=k+6) SetFXAttachment("" + k, albmic);
                for(k=129;k<=133;k=k+4) SetFXAttachment("" + k, albmic);
                for(k=132;k>=131;k=k-1) SetFXAttachment("" + k, albmic);
                break;
            case 4:
                for(k=130;k>=100;k=k-5) SetFXAttachment("" + k, albmic);
                for(k=101;k<=103;k=k+1) SetFXAttachment("" + k, albmic);
                for(k=109;k<=109;k=k+6) SetFXAttachment("" + k, albmic);
                for(k=114;k<=129;k=k+5) SetFXAttachment("" + k, albmic);
                for(k=133;k<=133;k=k+4) SetFXAttachment("" + k, albmic);
                for(k=132;k>=131;k=k-1) SetFXAttachment("" + k, albmic);
                break;
            case 5:
                for(k=130;k>=100;k=k-5) SetFXAttachment("" + k, albmic);
                for(k=101;k<=104;k=k+1) SetFXAttachment("" + k, albmic);
                for(k=118;k>=116;k=k-1) SetFXAttachment("" + k, albmic);
                for(k=134;k>=131;k=k-1) SetFXAttachment("" + k, albmic);
                break;
            case 6:
                for(k=130;k>=100;k=k-5) SetFXAttachment("" + k, albmic);
                for(k=101;k<=104;k=k+1) SetFXAttachment("" + k, albmic);
                for(k=118;k>=116;k=k-1) SetFXAttachment("" + k, albmic);
                break;
            case 7:
                for(k=125;k>=105;k=k-5) SetFXAttachment("" + k, albmic);
                for(k=101;k<=103;k=k+1) SetFXAttachment("" + k, albmic);
                for(k=109;k<=109;k=k+6) SetFXAttachment("" + k, albmic);
                for(k=129;k<=133;k=k+4) SetFXAttachment("" + k, albmic);
                for(k=132;k>=131;k=k-1) SetFXAttachment("" + k, albmic);
                for(k=124;k>=118;k=k-6) SetFXAttachment("" + k, albmic);
                for(k=117;k>=117;k=k-1) SetFXAttachment("" + k, albmic);
                break;
            case 8:
                for(k=130;k>=100;k=k-5) SetFXAttachment("" + k, albmic);
                for(k=134;k>=104;k=k-5) SetFXAttachment("" + k, albmic);
                for(k=118;k>=116;k=k-1) SetFXAttachment("" + k, albmic);
                break;
            case 9:
                for(k=101;k<=103;k=k+1) SetFXAttachment("" + k, albmic);
                for(k=131;k<=133;k=k+1) SetFXAttachment("" + k, albmic);
                for(k=107;k<=127;k=k+5) SetFXAttachment("" + k, albmic);
                break;
            case 10:
                for(k=100;k<=103;k=k+1) SetFXAttachment("" + k, albmic);
                for(k=104;k<=129;k=k+5) SetFXAttachment("" + k, albmic);
                for(k=133;k>=131;k=k-1) SetFXAttachment("" + k, albmic);
                for(k=125;k>=120;k=k-5) SetFXAttachment("" + k, albmic);
                break;
            case 11:
                for(k=130;k>=100;k=k-5) SetFXAttachment("" + k, albmic);
                for(k=116;k>=104;k=k-4) SetFXAttachment("" + k, albmic);
                for(k=122;k<=134;k=k+6) SetFXAttachment("" + k, albmic);
                break;
            case 12:
                for(k=130;k>=100;k=k-5) SetFXAttachment("" + k, albmic);
                for(k=131;k<=134;k=k+1) SetFXAttachment("" + k, albmic);
                break;
            case 13:
                for(k=130;k>=100;k=k-5) SetFXAttachment("" + k, albmic);
                for(k=134;k>=104;k=k-5) SetFXAttachment("" + k, albmic);
                for(k=106;k<=112;k=k+6) SetFXAttachment("" + k, albmic);
                for(k=108;k>=108;k=k-4) SetFXAttachment("" + k, albmic);
                break;
            case 14:
                for(k=130;k>=100;k=k-5) SetFXAttachment("" + k, albmic);
                for(k=134;k>=104;k=k-5) SetFXAttachment("" + k, albmic);
                for(k=111;k<=123;k=k+6) SetFXAttachment("" + k, albmic);
                break;
            case 15:
                for(k=125;k>=105;k=k-5) SetFXAttachment("" + k, albmic);
                for(k=129;k>=109;k=k-5) SetFXAttachment("" + k, albmic);
                for(k=101;k<=103;k=k+1) SetFXAttachment("" + k, albmic);
                for(k=131;k<=133;k=k+1) SetFXAttachment("" + k, albmic);
                break;
            case 16:
                for(k=130;k>=100;k=k-5) SetFXAttachment("" + k, albmic);
                for(k=101;k<=103;k=k+1) SetFXAttachment("" + k, albmic);
                for(k=109;k<=114;k=k+5) SetFXAttachment("" + k, albmic);
                for(k=118;k>=116;k=k-1) SetFXAttachment("" + k, albmic);
                break;
            case 17:
                for(k=125;k>=105;k=k-5) SetFXAttachment("" + k, albmic);
                for(k=129;k>=109;k=k-5) SetFXAttachment("" + k, albmic);
                for(k=101;k<=103;k=k+1) SetFXAttachment("" + k, albmic);
                for(k=131;k<=133;k=k+1) SetFXAttachment("" + k, albmic);
                for(k=134;k>=122;k=k-6) SetFXAttachment("" + k, albmic);
                break;
            case 18:
                for(k=130;k>=100;k=k-5) SetFXAttachment("" + k, albmic);
                for(k=101;k<=103;k=k+1) SetFXAttachment("" + k, albmic);
                for(k=109;k<=114;k=k+5) SetFXAttachment("" + k, albmic);
                for(k=118;k>=116;k=k-1) SetFXAttachment("" + k, albmic);
                for(k=134;k>=122;k=k-6) SetFXAttachment("" + k, albmic);
                break;
            case 19:
                for(k=104;k>=101;k=k-1) SetFXAttachment("" + k, albmic);
                for(k=105;k<=110;k=k+5) SetFXAttachment("" + k, albmic);
                for(k=116;k<=118;k=k+1) SetFXAttachment("" + k, albmic);
                for(k=124;k<=129;k=k+5) SetFXAttachment("" + k, albmic);
                for(k=133;k>=130;k=k-1) SetFXAttachment("" + k, albmic);
                break;
            case 20:
                for(k=100;k<=104;k=k+1) SetFXAttachment("" + k, albmic);
                for(k=107;k<=132;k=k+5) SetFXAttachment("" + k, albmic);
                break;
            case 21:
                for(k=125;k>=100;k=k-5) SetFXAttachment("" + k, albmic);
                for(k=129;k>=104;k=k-5) SetFXAttachment("" + k, albmic);
                for(k=131;k<=133;k=k+1) SetFXAttachment("" + k, albmic);
                break;
            case 22:
                for(k=100;k<=120;k=k+5) SetFXAttachment("" + k, albmic);
                for(k=126;k<=132;k=k+6) SetFXAttachment("" + k, albmic);
                for(k=128;k>=124;k=k-4) SetFXAttachment("" + k, albmic);
                for(k=119;k>=104;k=k-5) SetFXAttachment("" + k, albmic);
                break;
            case 23:
                for(k=100;k<=125;k=k+5) SetFXAttachment("" + k, albmic);
                for(k=131;k>=127;k=k-4) SetFXAttachment("" + k, albmic);
                for(k=122;k>=117;k=k-5) SetFXAttachment("" + k, albmic);
                for(k=133;k>=129;k=k-4) SetFXAttachment("" + k, albmic);
                for(k=124;k>=104;k=k-5) SetFXAttachment("" + k, albmic);
                break;
            case 24:
                for(k=100;k<=105;k=k+5) SetFXAttachment("" + k, albmic);
                for(k=125;k<=130;k=k+5) SetFXAttachment("" + k, albmic);
                for(k=104;k<=109;k=k+5) SetFXAttachment("" + k, albmic);
                for(k=129;k<=134;k=k+5) SetFXAttachment("" + k, albmic);
                for(k=111;k<=123;k=k+6) SetFXAttachment("" + k, albmic);
                for(k=121;k>=113;k=k-4) SetFXAttachment("" + k, albmic);
                break;
            case 25: //Y
                for(k=105;k<=117;k=k+6) SetFXAttachment("" + k, albmic);
                for(k=113;k>=109;k=k-4) SetFXAttachment("" + k, albmic);
                for(k=122;k<=132;k=k+5) SetFXAttachment("" + k, albmic);
                for(k=100;k<=100;k=k+5) SetFXAttachment("" + k, albmic);
                for(k=104;k<=104;k=k+5) SetFXAttachment("" + k, albmic);
                break;
            case 26: //Z
                for(k=100;k<=104;k=k+1) SetFXAttachment("" + k, albmic);
                for(k=108;k<=120;k=k+4) SetFXAttachment("" + k, albmic);
                for(k=125;k<=130;k=k+5) SetFXAttachment("" + k, albmic);
                for(k=131;k<=134;k=k+1) SetFXAttachment("" + k, albmic);
                for(k=109;k<=109;k=k+5) SetFXAttachment("" + k, albmic);
                break;
            case 27: //Down Arrow
                for(k=102;k<=127;k=k+5) SetFXAttachment("" + k, albmic);
                for(k=132;k>=120;k=k-6) SetFXAttachment("" + k, albmic);
                for(k=128;k>=124;k=k-4) SetFXAttachment("" + k, albmic);
                break;
            /****** START OF OBSOLETE - NOT USED ******/
            case 28: //1
                for(k=102;k<=106;k=k+4) SetFXAttachment("" + k, verdemic);
                for(k=107;k<=127;k=k+5) SetFXAttachment("" + k, verdemic);
                for(k=131;k<=133;k=k+1) SetFXAttachment("" + k, verdemic);
                break;
            case 29: //2
                for(k=102;k<=106;k=k+4) SetFXAttachment("" + k, verdemic);
                for(k=108;k<=113;k=k+5) SetFXAttachment("" + k, verdemic);
                for(k=117;k<=121;k=k+4) SetFXAttachment("" + k, verdemic);
                for(k=126;k<=131;k=k+5) SetFXAttachment("" + k, verdemic);
                for(k=132;k<=133;k=k+1) SetFXAttachment("" + k, verdemic);
                break;
            case 30: //3
                for(k=102;k<=106;k=k+4) SetFXAttachment("" + k, verdemic);
                for(k=108;k<=113;k=k+5) SetFXAttachment("" + k, verdemic);
                for(k=117;k<=123;k=k+6) SetFXAttachment("" + k, verdemic);
                for(k=123;k<=128;k=k+5) SetFXAttachment("" + k, verdemic);
                for(k=126;k<=132;k=k+6) SetFXAttachment("" + k, verdemic);
                break;
            case 31: //4
                for(k=103;k<=111;k=k+4) SetFXAttachment("" + k, verdemic);
                for(k=116;k<=117;k=k+1) SetFXAttachment("" + k, verdemic);
                for(k=108;k<=133;k=k+5) SetFXAttachment("" + k, verdemic);
                break;
            case 32: //5
                for(k=101;k<=103;k=k+1) SetFXAttachment("" + k, verdemic);
                for(k=106;k<=111;k=k+5) SetFXAttachment("" + k, verdemic);
                for(k=117;k<=123;k=k+6) SetFXAttachment("" + k, verdemic);
                for(k=128;k<=132;k=k+4) SetFXAttachment("" + k, verdemic);
                for(k=126;k<=132;k=k+6) SetFXAttachment("" + k, verdemic);
                break;
            case 33: //6
                for(k=102;k<=108;k=k+6) SetFXAttachment("" + k, verdemic);
                for(k=106;k<=126;k=k+5) SetFXAttachment("" + k, verdemic);
                for(k=117;k<=132;k=k+15) SetFXAttachment("" + k, verdemic);
                for(k=123;k<=128;k=k+5) SetFXAttachment("" + k, verdemic);
                break;
            case 34: //7
                for(k=101;k<=106;k=k+5) SetFXAttachment("" + k, verdemic);
                for(k=102;k<=103;k=k+1) SetFXAttachment("" + k, verdemic);
                for(k=108;k<=113;k=k+5) SetFXAttachment("" + k, verdemic);
                for(k=117;k<=132;k=k+5) SetFXAttachment("" + k, verdemic);
                break;
            case 35: //8
                for(k=102;k<=132;k=k+15) SetFXAttachment("" + k, verdemic);
                for(k=106;k<=111;k=k+5) SetFXAttachment("" + k, verdemic);
                for(k=121;k<=126;k=k+5) SetFXAttachment("" + k, verdemic);
                for(k=123;k<=128;k=k+5) SetFXAttachment("" + k, verdemic);
                for(k=108;k<=113;k=k+5) SetFXAttachment("" + k, verdemic);
                break;
            case 36: //9
                for(k=102;k<=132;k=k+15) SetFXAttachment("" + k, verdemic);
                for(k=126;k<=132;k=k+6) SetFXAttachment("" + k, verdemic);
                for(k=108;k<=128;k=k+5) SetFXAttachment("" + k, verdemic);
                for(k=106;k<=111;k=k+5) SetFXAttachment("" + k, verdemic);
                break;
            case 37: //10
                for(k=100;k<=130;k=k+5) SetFXAttachment("" + k, verdemic);
                for(k=107;k<=127;k=k+5) SetFXAttachment("" + k, verdemic);
                for(k=109;k<=129;k=k+5) SetFXAttachment("" + k, verdemic);
                for(k=103;k<=133;k=k+30) SetFXAttachment("" + k, verdemic);
                break;
            case 38: //11
                for(k=101;k<=131;k=k+5) SetFXAttachment("" + k, verdemic);
                for(k=104;k<=134;k=k+5) SetFXAttachment("" + k, verdemic);
                for(k=105;k<=108;k=k+3) SetFXAttachment("" + k, verdemic);
                break;
            case 39: //12
                for(k=100;k<=130;k=k+5) SetFXAttachment("" + k, verdemic);
                for(k=103;k<=107;k=k+4) SetFXAttachment("" + k, verdemic);
                for(k=109;k<=114;k=k+5) SetFXAttachment("" + k, verdemic);
                for(k=118;k<=122;k=k+4) SetFXAttachment("" + k, verdemic);
                for(k=127;k<=132;k=k+5) SetFXAttachment("" + k, verdemic);
                for(k=133;k<=134;k=k+1) SetFXAttachment("" + k, verdemic);
                break;
            case 40: //13
                for(k=100;k<=130;k=k+5) SetFXAttachment("" + k, verdemic);
                for(k=103;k<=107;k=k+4) SetFXAttachment("" + k, verdemic);
                for(k=109;k<=114;k=k+5) SetFXAttachment("" + k, verdemic);
                for(k=118;k<=124;k=k+6) SetFXAttachment("" + k, verdemic);
                for(k=124;k<=129;k=k+5) SetFXAttachment("" + k, verdemic);
                for(k=127;k<=133;k=k+6) SetFXAttachment("" + k, verdemic);
                break;
            case 41: //14
                for(k=100;k<=130;k=k+5) SetFXAttachment("" + k, verdemic);
                for(k=104;k<=112;k=k+4) SetFXAttachment("" + k, verdemic);
                for(k=117;k<=118;k=k+1) SetFXAttachment("" + k, verdemic);
                for(k=109;k<=134;k=k+5) SetFXAttachment("" + k, verdemic);
                break;
            /****** END OF OBSOLETE - NOT USED ******/
            default:;
        }
    }


    //
    // Light up speed bars
    //
    void LightBar(int k)
    {
        // Bara galbena 60km/h
        if (has_bar == 1 or has_bar == 3)
            if (k == R_60)
            {
                SetFXAttachment("45", galbenmic);
                SetFXAttachment("46", galbenmic);
                SetFXAttachment("47", galbenmic);
                SetFXAttachment("48", galbenmic);
            }
            else
            {
                SetFXAttachment("45", null);
                SetFXAttachment("46", null);
                SetFXAttachment("47", null);
                SetFXAttachment("48", null);
            }

        // Bara verde 90km/h
        if (has_bar == 2 or has_bar == 3)
            if (k == R_90)
            {
                SetFXAttachment("40", verdemic);
                SetFXAttachment("41", verdemic);
                SetFXAttachment("42", verdemic);
                SetFXAttachment("43", verdemic);
            }
            else
            {
                SetFXAttachment("40", null);
                SetFXAttachment("41", null);
                SetFXAttachment("42", null);
                SetFXAttachment("43", null);
            }
    }


    //
    // Light up the current limit TMV indicator
    //
    void LightThisLimit(int k)
    {
        if (signal_type != "TMV")
            return;
        if (has_bar == 0 or has_bar == 2)
            return;

        switch(k)
        {
            case R_VS:
                GetFXAttachment("iv").SetFXTextureReplacement("cifra", Letters, 7);
                break;
            case R_T20:
                GetFXAttachment("iv").SetFXTextureReplacement("cifra", Letters, 8);
                break;
            case R_T30:
                GetFXAttachment("iv").SetFXTextureReplacement("cifra", Letters, 9);
                break;
            case R_T60:
                GetFXAttachment("iv").SetFXTextureReplacement("cifra", Letters, 10);
                break;
            case R_T80:
                GetFXAttachment("iv").SetFXTextureReplacement("cifra", Letters, 11);
                break;
            case R_T90:
                GetFXAttachment("iv").SetFXTextureReplacement("cifra", Letters, 12);
                break;
            case R_T100:
                GetFXAttachment("iv").SetFXTextureReplacement("cifra", Letters, 13);
                break;
            case R_TVS:
                GetFXAttachment("iv").SetFXTextureReplacement("cifra", Letters, 7);
                break;
            default:
                break;
        }
    }

    //
    // Light up the next limit TMV indicator
    //
    void LightNextLimit(int k)
    {
        if (signal_type != "TMV")
            return;
        if (has_bar == 0 or has_bar == 1)
            return;

        switch(k)
        {
            case R_VS:
                GetFXAttachment("pv").SetFXTextureReplacement("cifra", Letters, 0);
                break;
            case R_T20:
                GetFXAttachment("pv").SetFXTextureReplacement("cifra", Letters, 1);
                break;
            case R_T30:
                GetFXAttachment("pv").SetFXTextureReplacement("cifra", Letters, 2);
                break;
            case R_T60:
                GetFXAttachment("pv").SetFXTextureReplacement("cifra", Letters, 3);
                break;
            case R_T80:
                GetFXAttachment("pv").SetFXTextureReplacement("cifra", Letters, 4);
                break;
            case R_T90:
                GetFXAttachment("pv").SetFXTextureReplacement("cifra", Letters, 5);
                break;
            case R_T100:
                GetFXAttachment("pv").SetFXTextureReplacement("cifra", Letters, 6);
                break;
            case R_TVS:
                GetFXAttachment("pv").SetFXTextureReplacement("cifra", Letters, 0);
                break;
            default:
                break;
        }
    }

    //
    // Cauta markeri pt iesire grup
    //
    void FindMarkerLinie()
    {
        linie = 0;

        if (!is_grup)
            return;

        GSTrackSearch GSTS = BeginTrackSearch(false);
        MapObject mo = GSTS.SearchNext();

        while (mo)
        {
            if (cast<Semnal>mo and GSTS.GetFacingRelativeToSearchDirection())
            {
                break;
            }

            if (!GSTS.GetFacingRelativeToSearchDirection())
            {
                if (mo.GetAsset().GetConfigSoup().GetNamedSoup("extensions").GetNamedTagAsInt("rosig_ln-474195", 0))
                {
                    linie = mo.GetAsset().GetConfigSoup().GetNamedSoup("extensions").GetNamedTagAsInt("rosig_ln-474195");
                }
            }
            mo = GSTS.SearchNext();
        }
    }

    //
    // Cauta markeri
    //
    int FindMarker(void)
    {
        GSTrackSearch GSTS = BeginTrackSearch(true);
        MapObject mo = GSTS.SearchNext();
        //int restriction;

        direction = 0;
        ies_st = 0;
        if (signal_type == "TMV")
            restriction = R_TVS;
        else
            restriction = R_VS;

        int found_restriction = R_VS;
        bool found_manevra = false;
        
        if (DEBUG) Interface.Log("SIG-RO-CFR-DBG> " + GetLocalisedName() + " : FindMarker");
        
        while (mo)
        {
            if (cast<Semnal>mo and GSTS.GetFacingRelativeToSearchDirection())
            {
                // sari peste semnalele de manevra care sunt intercalate cu cele de intrare
                if ((cast<Semnal>mo).is_manevra and !((cast<Semnal>mo).is_intrare or (cast<Semnal>mo).is_iesire or (cast<Semnal>mo).is_triere))
                    found_manevra = true;
                else // daca am ajuns la urmatorul semnal nu ne mai intereseaza markere
                    break;
            }

            //Întotdeauna găsește ultimul marker. De exemplu dacă ai mai multe linii abătute și întîlnește mai multe direcții/restricții, ultimul întîlnit e cel afișat.
            if (GSTS.GetFacingRelativeToSearchDirection())
            {
                if (mo.GetAsset().GetConfigSoup().GetNamedSoup("extensions").GetNamedTagAsInt("rosig_vr-474195", 0))
                {
                    found_restriction = mo.GetAsset().GetConfigSoup().GetNamedSoup("extensions").GetNamedTagAsInt("rosig_vr-474195");

                    // daca avem semnal de manevra dedicat nu mai afisez manevra pe semnal de intrare/iesire
                    if (!((found_restriction == R_MANEVRA and found_manevra) and (is_intrare or is_iesire or is_triere)))
                        restriction = found_restriction;

                    //daca avem semnal de manevra si am gasit marker de manevra, nu mai cauta alti markeri
                    if (is_manevra and !(is_intrare or is_iesire or is_triere) and restriction == R_MANEVRA)
                        break;

                    if (DEBUG) Interface.Log("SIG-RO-CFR-DBG> " + GetLocalisedName() + " : Găsit marker restrictie = " + restriction);
                }
                else if (mo.GetAsset().GetConfigSoup().GetNamedSoup("extensions").GetNamedTagAsInt("rosig_dir-474195", 0))
                {
                    direction = mo.GetAsset().GetConfigSoup().GetNamedSoup("extensions").GetNamedTagAsInt("rosig_dir-474195");
                    if (DEBUG) Interface.Log("SIG-RO-CFR-DBG> " + GetLocalisedName() + " : Găsit marker direcție = " + direction);
                }
                else if (mo.GetAsset().GetConfigSoup().GetNamedSoup("extensions").GetNamedTagAsBool("rosig_st-474195", false))
                {
                    ies_st = 1;
                    if (DEBUG) Interface.Log("SIG-RO-CFR-DBG> " + GetLocalisedName() + " : Găsit marker ieșire stînga = " + ies_st);
                }
            }
            mo = GSTS.SearchNext();
        }

        return restriction;
    }

    //
    // Functia de stingere a tuturor becurilor semnalelor
    //
    void LightsOff()
    {
        if (signal_type == "MEC" or signal_type == "MEC_DR")
        {
            if (is_repetitor)
            { // MECANIC REPETITOR
                SetFXCoronaTexture(B_GALBEN, null);
                SetMeshAnimationFrame("default", 0, 1);
            }
            if (is_intrare or is_iesire)
            {
                if (lights_count == 1)
                { // MECANIC INTRARE sau IESIRE 1i
                    SetFXCoronaTexture(B_ROSU, null);
                    SetMeshAnimationFrame("default", 0, 1);
                }
                else if (lights_count == 2)
                { // MECANIC INTRARE sau IESIRE cu 2i
                    SetFXCoronaTexture(B_ROSU, null);
                    SetFXCoronaTexture(B_GALBEN, null);
                    SetMeshAnimationFrame("default", 60, 1);
                }
                else if (lights_count == 3)
                { // MECANIC INTRARE sau IESIRE cu 3i
                    SetFXCoronaTexture(B_ROSU, null);
                    SetFXCoronaTexture(B_GALBEN, null);
                    SetFXCoronaTexture(B_GAL_JOS, null);
                    SetMeshAnimationFrame("default", 60, 1);
                    SetMeshAnimationFrame("paleta", 0, 2);
                }
                else
                {
                    Exception("SIG-RO-CFR-ERR> Else clause!");
                }
            }
            if (is_manevra)
            { // MECANIC MANEVRA
                SetFXCoronaTexture(B_ALB, null);
                SetMeshAnimationFrame("default", 0, 1);
            }
            if (is_prevestitor)
            {
                if (lights_count == 1)
                { // MECANIC PREVESTITOR 2i
                    SetFXCoronaTexture(B_GALBEN, null);
                    SetMeshAnimationFrame("default", 0, 1);
                }
                else if (lights_count == 2)
                { // MECANIC PREVESTITOR 3i
                    SetFXCoronaTexture(B_GALBEN, null);
                    SetFXCoronaTexture(B_GAL_JOS, null);
                    SetMeshAnimationFrame("default", 0, 2);
                    if (signal_type == "MEC")
                        SetMeshAnimationFrame("paleta", 60, 1);
                    else if (signal_type == "MEC_DR")
                        SetMeshAnimationState("paleta", false);
                }
                else
                {
                    Exception("SIG-RO-CFR-ERR> Else clause!");
                }
            }
        }
        else if (signal_type == "DTV")
        {
            if (is_avarie)
            { // DTV AVARIE sau BLA av
                SetFXAttachment(B_ROSU_AV, null);
            }
            if (is_intrare or is_iesire)
            {
                if (lights_count == 2)
                { // SSSR 2
                    SetFXAttachment(B_ROSU, null);
                    SetFXAttachment(B_ALB, null);
                    SetFXAttachment(B_CHEMARE, null);
                }
                else if (lights_count == 3)
                { // SSSR 3
                    SetFXAttachment(B_ROSU, null);
                    SetFXAttachment(B_GALBEN, null);
                    SetFXAttachment(B_VERDE, null);
                    if (is_manevra or is_chemare)
                    {
                        SetFXAttachment(B_ALB, null);
                        LightStanga(0);
                        SetFXAttachment(B_CHEMARE, null);
                    }
                }
                else if (lights_count == 4)
                { // SSSR 4
                    SetFXAttachment(B_ROSU, null);
                    SetFXAttachment(B_GALBEN, null);
                    SetFXAttachment(B_VERDE, null);
                    SetFXAttachment(B_GAL_JOS, null);
                    if (is_manevra or is_chemare)
                    {
                        SetFXAttachment(B_ALB, null);
                        LightStanga(0);
                        SetFXAttachment(B_CHEMARE, null);
                    }
                }
                else if (lights_count == 5)
                { // SSSR 5
                    SetFXAttachment(B_ROSU, null);
                    SetFXAttachment(B_GALBEN, null);
                    SetFXAttachment(B_VERDE, null);
                    SetFXAttachment(B_GAL_JOS, null);
                    if (is_manevra or is_chemare)
                    {
                        SetFXAttachment(B_ALB, null);
                        LightStanga(0);
                        SetFXAttachment(B_CHEMARE, null);
                    }
                }
                else
                {
                    Exception("SIG-RO-CFR-ERR> Else clause!");
                }
            }
            if (is_bla or is_bla4i)
            { // DTV BLA
                SetFXAttachment(B_ROSU, null);
                SetFXAttachment(B_GALBEN, null);
                SetFXAttachment(B_VERDE, null);
            }
            if (is_manevra and !is_intrare and !is_iesire)
            { // DTV MANEVRA fara INTRARE sau IESIRE
                SetFXAttachment(B_ALBASTRU, null);
                SetFXAttachment(B_ALB, null);
            }
            if (is_prevestitor)
            { // DTV PREVESTITOR
                SetFXAttachment(B_GALBEN, null);
                SetFXAttachment(B_VERDE, null);
            }
            if (is_repetitor)
            { // DTV REPETITOR
                SetFXAttachment("50",null);
                SetFXAttachment("51",null);
                SetFXAttachment("52",null);
                SetFXAttachment("53",null);
                SetFXAttachment("54",null);
                SetFXAttachment("55",null);
                SetFXAttachment("56",null);
                SetFXAttachment("57",null);
                SetFXAttachment("58",null);
                SetFXAttachment("59",null);
                SetFXAttachment("60",null);
                SetFXAttachment("61",null);
                SetFXAttachment("62",null);
            }

            LightBar(0);
        }
        else if (signal_type == "TMV")
        {
            if (is_avarie)
            { // TMV AVARIE sau BLA av
                SetFXAttachment(B_ROSU_AV, null);
            }
            if (is_intrare or is_iesire)
            {
                if (lights_count == 2)
                { // TMV 2
                    SetFXAttachment(B_ROSU, null);
                    SetFXAttachment(B_GALBEN, null);
                    SetFXAttachment(B_ALB, null);
                    SetFXAttachment(B_CHEMARE, null);
                    LightStanga(0);
                }
                else if (lights_count == 3)
                { // TMV 3
                    SetFXAttachment(B_ROSU, null);
                    SetFXAttachment(B_GALBEN, null);
                    SetFXAttachment(B_VERDE, null);
                    if (is_manevra or is_chemare)
                    {
                        SetFXAttachment(B_ALB, null);
                        LightStanga(0);
                        SetFXAttachment(B_CHEMARE, null);
                    }
                }
                else if (lights_count == 5)
                { // TMV 5
                    SetFXAttachment(B_ROSU, null);
                    SetFXAttachment(B_GALBEN, null);
                    SetFXAttachment(B_VERDE, null);
                    if (is_manevra or is_chemare)
                    {
                        SetFXAttachment(B_ALB, null);
                        LightStanga(0);
                        SetFXAttachment(B_CHEMARE, null);
                    }
                }
                else
                {
                    Exception("SIG-RO-CFR-ERR> Else clause!");
                }
            }
            if (is_bla)
            { // TMV BLA
                SetFXAttachment(B_ROSU, null);
                SetFXAttachment(B_GALBEN, null);
                SetFXAttachment(B_VERDE, null);
            }
            if (is_manevra and !is_intrare and !is_iesire)
            { // TMV MANEVRA fara INTRARE sau IESIRE
                SetFXAttachment(B_ALBASTRU, null);
                SetFXAttachment(B_ALB, null);
            }
            if (is_prevestitor)
            { // TMV PREVESTITOR
                SetFXAttachment(B_GALBEN, null);
                SetFXAttachment(B_VERDE, null);
            }
            if (is_repetitor)
            { // TMV REPETITOR
                SetFXAttachment("50",null);
                SetFXAttachment("51",null);
                SetFXAttachment("52",null);
                SetFXAttachment("53",null);
                SetFXAttachment("54",null);
                SetFXAttachment("55",null);
                SetFXAttachment("56",null);
                SetFXAttachment("57",null);
                SetFXAttachment("58",null);
                SetFXAttachment("59",null);
                SetFXAttachment("60",null);
                SetFXAttachment("61",null);
                SetFXAttachment("62",null);
            }
        }
        else if (signal_type == "TRIERE")
        {
            SetFXAttachment(B_ROSU, null);
            SetFXAttachment(B_GALBEN, null);
            SetFXAttachment(B_VERDE, null);
            SetFXAttachment(B_ALB, null);
        }
        else
        {
            Exception("SIG-RO-CFR-ERR> Unknown signal_type: " + signal_type);
        }
    }


    //
    // Find next signal and junctions and link
    //
    void LinkSemnal(bool direction)
    {
        GSTrackSearch GSTS;
        MapObject mo;
        string dir;
        int idx;

        if (direction)
            idx = LINK_NEXT;
        else
            idx = LINK_PREV;

        if (DEBUG) {
            if (direction)
                dir = "forward";
            else
                dir = "backward";
            Interface.Log("SIG-RO-CFR-DBG> " + GetLocalisedName() + " : LinkSemnal " + dir);
        }

        // Find signal and junction based on direction
        GSTS = BeginTrackSearch(direction);
        mo = GSTS.SearchNext();
        while (mo)
        {
            if (cast<Semnal>mo and (GSTS.GetFacingRelativeToSearchDirection() == direction))
            {
                // daca avem semnale CFR
                linkSignal[idx] = cast<Signal>mo;
                if (direction)
                    next_aspect = (cast<Semnal>mo).this_aspect;
                if (DEBUG)
                    Interface.Log("SIG-RO-CFR-DBG> " + GetLocalisedName() + " : CFR Signal found " + dir + " = " + mo.GetLocalisedName());

                // opreste cautarea doar daca ai intilnit orice alt semnal in afara de manevra
                // nu lega in schema de semnalizare semnalele de manevra
                if (!((cast<Semnal>mo).is_manevra and !((cast<Semnal>mo).is_intrare or (cast<Semnal>mo).is_iesire or (cast<Semnal>mo).is_triere)))
                    break;
            }
            else if (cast<Signal>mo and (GSTS.GetFacingRelativeToSearchDirection() == direction))
            {
                // daca avem semnale Trainz standard
                linkSignal[idx] = cast<Signal>mo;
                if (direction)
                {
                    next_aspect = (cast<Signal>mo).GetSignalState();
                    // Convert Trainz signal state to CFR state
                    switch (next_aspect)
                    {
                        case GREEN:
                            next_aspect = S_VERDE;
                            break;
                        case YELLOW:
                            next_aspect = S_GALBEN;
                            break;
                        default:
                            next_aspect = S_ROSU;
                            break;
                    }
                }

                if (DEBUG)
                    Interface.Log("SIG-RO-CFR-DBG> " + GetLocalisedName() + " : Trainz Signal found " + dir + " = " + mo.GetLocalisedName());

                break;
            }
            else if (cast<Junction>mo)
            {
                // daca avem macaz, adauga-l in lista de macazuri
                if (DEBUG)
                    Interface.Log("SIG-RO-CFR-DBG> " + GetLocalisedName() + " : Found junction " + dir + " = " + mo.GetLocalisedName());

                junctionIDList[junctionIDList.size()] = mo.GetGameObjectID();
            }
            mo = GSTS.SearchNext();
        }

        //DEBUG: Printează toată lista de macazuri
        //Interface.Log(GetLocalisedName() + ": junctionIDList: ");
        //int i;
        //for (i=0;i<junctionIDList.size();++i)
        //    Interface.Log("  -> " + junctionIDList[i].GetName());
    }

    //
    // Nofity Signals
    //
    void Notify()
    {
        if (linkSignal[LINK_PREV]) {
            if (DEBUG)
                Interface.Log("SIG-RO-CFR-DBG> " + GetLocalisedName() + " : Send state change to " + linkSignal[LINK_PREV].GetLocalisedName() + ": stare/" + this_aspect);

            PostMessage(linkSignal[LINK_PREV], "Semnal", "stare/" + this_aspect, 0.0);
        }
        else
        {
            if (DEBUG)
                Interface.Log("SIG-RO-CFR-DBG> " + GetLocalisedName() + " : No previous signal to notify.");
        }
    }


    //
    // Get BLA signal state considering orienarea de bloc
    //
    int GetBLASignalState()
    {
        if (orientare_bla == false) // dacă nu avem tren care vine spre semnal, atunci menține pe roșu
            return S_BLOC_INVERS;

        return GetSignalState();
    }


    //
    // Update Triere Signal State
    //
    void UpdateTriere(void)
    {
        this_aspect = special_restrict;

        if (this_aspect < S_ROSU)
        {
            // it does not support automatic aspect
            this_aspect = S_ROSU;
        }

        if (DEBUG)
            Interface.Log("SIG-RO-CFR-DBG> " + GetLocalisedName() + " : this_aspect: " + this_aspect + " memo_aspect: " + memo_aspect);

        // set signal aspect
        if (this_aspect != memo_aspect)
        {
            memo_aspect = this_aspect;
            Notify();
            LightsOff();

            switch (this_aspect)
            {
                case S_ROSU:
                    SetFXAttachment(B_ROSU, rosu);
                    break;
                case S_GALBEN:
                    SetFXAttachment(B_GALBEN, galben);
                    break;
                case S_VERDE:
                    SetFXAttachment(B_VERDE, verde);
                    break;
                case S_ALB_CL:
                    SetFXAttachment(B_ALB, albclipitor);
                    SetSpeedLimit(20/3.6);
                    //SetSignalState(null, GREEN, "Depășire permisă");
                    break;
                case S_ROSU_CL:
                    SetFXAttachment(B_ROSU, rosuclipitor);
                    SetSpeedLimit(20/3.6);
                    break;
                case S_ALB:
                    SetFXAttachment(B_ALB, alb);
                    SetSpeedLimit(20/3.6);
                    //SetSignalState(null, GREEN, "Manevra permisă");
                    break;
                default:
                    Interface.Log("SIG-RO-CFR-ERR> " + GetLocalisedName() + " : Invalid aspect: " + this_aspect);
                    break;
            }
        }
    }


    //
    // Update Avarie Signal State
    //
    void UpdateAvarie(void)
    {
        if (special_restrict == S_ROSU)
        {
            this_aspect = S_ROSU;
            SetFXAttachment(B_ROSU_AV, rosu);
            //SetSignalState(null, RED, "Avarie la trecerea la nivel");
        }
        else
        {
            this_aspect = next_aspect;
            LightsOff();
        }

        if (DEBUG)
            Interface.Log("SIG-RO-CFR-DBG> " + GetLocalisedName() + " : this_aspect: " + this_aspect + " memo_aspect: " + memo_aspect);

        // set signal aspect
        if (this_aspect != memo_aspect)
        {
            memo_aspect = this_aspect;
            Notify();
        }
    }


    //
    // Update Manevra Signal State
    //
    void UpdateManevra(void)
    {
        restriction = FindMarker();

        if (special_restrict == S_ALB or restriction == R_MANEVRA)
        {
            this_aspect = S_ALB;
            //memo_aspect = AUTOMATIC; // force update state and Notify
        }
        else
        {
            this_aspect = next_aspect;
        }

        if (DEBUG)
            Interface.Log("SIG-RO-CFR-DBG> " + GetLocalisedName() + " : this_aspect: " + this_aspect + " memo_aspect: " + memo_aspect);

        // set signal aspect
        if (this_aspect != memo_aspect)
        {
            memo_aspect = this_aspect;
            Notify();
            LightsOff();

            switch (this_aspect)
            {
                case S_ALB:
                    if (signal_type == "MEC")
                    {
                        SetFXCoronaTexture(B_ALB, alb);
                        SetMeshAnimationFrame("default", 30, 1);
                    }
                    else
                    {
                        SetFXAttachment(B_ALB, alb);
                    }
                    SetSpeedLimit(20/3.6);
                    //SetSignalState(null, GREEN, "Manevra permisă");
                    break;
                default:
                    if (signal_type == "MEC")
                    {
                        SetFXCoronaTexture(B_ALB, albastru);
                        SetMeshAnimationFrame("default", 0, 1);
                    }
                    else
                    {
                        SetFXAttachment(B_ALBASTRU, albastru);
                    }
                    break;
            }
        }
    }


    //
    // Update Repetitor Signal State
    //
    void UpdateRepetitor(void)
    {
        this_aspect = next_aspect;

        if (DEBUG)
            Interface.Log("SIG-RO-CFR-DBG> " + GetLocalisedName() + " : this_aspect: " + this_aspect + " memo_aspect: " + memo_aspect);

        // set signal aspect
        if (this_aspect != memo_aspect)
        {
            memo_aspect = this_aspect;
            Notify();
            LightsOff();

            if (signal_type == "MEC")
            {
                if (this_aspect == S_ROSU)
                {
                    SetMeshAnimationFrame("default", 0, 1);
                    SetFXCoronaTexture(B_GALBEN, galben);
                }
                else
                {
                    SetMeshAnimationFrame("default", 30, 1);
                    SetFXCoronaTexture(B_GALBEN, verde);
                }
            }
            else
            {
                if (this_aspect == S_ROSU)
                {
                    SetFXAttachment("50", albmic);
                    SetFXAttachment("51", albmic);
                    SetFXAttachment("52", albmic);
                    SetFXAttachment("53", albmic);
                    SetFXAttachment("57", albmic);
                    SetFXAttachment("58", albmic);
                    SetFXAttachment("59", albmic);
                }
                else if (this_aspect == S_GALBEN or
                        (this_aspect >= S_GAL_CL and this_aspect <= T_VER_CL_100))
                {
                    SetFXAttachment("50", albmic);
                    SetFXAttachment("51", albmic);
                    SetFXAttachment("52", albmic);
                    SetFXAttachment("53", albmic);
                    SetFXAttachment("54", albmic);
                    SetFXAttachment("55", albmic);
                    SetFXAttachment("56", albmic);
                }
                else if (this_aspect == S_VERDE or this_aspect >= T_VERDE)
                {
                    SetFXAttachment("50", albmic);
                    SetFXAttachment("51", albmic);
                    SetFXAttachment("52", albmic);
                    SetFXAttachment("53", albmic);
                    SetFXAttachment("60", albmic);
                    SetFXAttachment("61", albmic);
                    SetFXAttachment("62", albmic);
                }
                else
                {
                    Interface.Log("SIG-RO-CFR-ERR> " + GetLocalisedName() + " : Invalid aspect: " + this_aspect);
                }
            }
        }
    }


    //
    // Update DTV Signal State
    //
    thread void UpdateDTV()
    {
        // INTRARE sau IESIRE DTV 2
        if ((is_intrare or is_iesire) and lights_count == 2)
        {
            if (GetSignalState() == RED or (next_aspect == AUTOMATIC))
            {
                this_aspect = S_ROSU;
                if (this_aspect != memo_aspect)
                {
                    memo_aspect = this_aspect;
                    Notify();
                    LightsOff();
                    SetFXAttachment(B_ROSU, rosu);
                }
            }
            else
            {
                // INTRARE
                if(is_intrare)
                {
                    this_aspect = S_ALB_CL;

                    if (this_aspect != memo_aspect)
                    {
                        Notify();
                        memo_aspect = this_aspect;
                        LightsOff();
                        SetFXAttachment(B_ROSU, rosu);
                        SetFXAttachment(B_CHEMARE, albclipitor);
                        SetSpeedLimit(20/3.6);
                    }
                }

                // IESIRE
                if(is_iesire)
                {
                    this_aspect = S_ALB;

                    if (this_aspect != memo_aspect)
                    {
                        Notify();
                        memo_aspect = this_aspect;
                        LightsOff();
                        SetFXAttachment(B_ALB, alb);
                        SetSpeedLimit(20/3.6);
                    }
                }
            }
        }

        // INTRARE si IESIRE 3, 4, 5
        if ((is_intrare or is_iesire) and lights_count != 2)
        {
            int restriction = FindMarker();

            // CHEMARE
            if (is_chemare and (special_restrict == S_ALB_CL or restriction == R_CHEMARE))
            {
                this_aspect=S_ALB_CL;
                if (this_aspect!=memo_aspect)
                {
                    memo_aspect=this_aspect;
                    Notify();
                    LightsOff();
                    LightDirection(0);

                    SetFXAttachment(B_CHEMARE, albclipitor);
                    SetFXAttachment(B_ROSU, rosu);
                    SetSpeedLimit(20/3.6);
                    //SetSignalState(null, GREEN, "Depășire permisă");
                }
            } // MANEVRA
            else if (is_manevra and (special_restrict == S_ALB or restriction == R_MANEVRA))
            {
                this_aspect=S_ALB;
                if (this_aspect!=memo_aspect)
                {
                    memo_aspect=this_aspect;
                    Notify();
                    LightsOff();
                    LightDirection(0);

                    SetFXAttachment(B_ALB, alb);
                    SetSpeedLimit(20/3.6);
                    //SetSignalState(null, GREEN, "Manevra permisă");
                }
            }
            else if (GetSignalState() == RED or (next_aspect == AUTOMATIC))
            {
                this_aspect = S_ROSU;
                if (this_aspect != memo_aspect)
                {
                    memo_aspect = S_ROSU;
                    LightsOff();
                    SetFXAttachment(B_ROSU, rosu);
                    Notify();
                    LightDirection(0);
                }
            }
            else
            {
                switch (next_aspect)
                {
                case S_ROSU:
                    this_aspect=S_GALBEN;
                    break;
                case S_GALBEN:
                    this_aspect=S_VERDE;
                    break;
                case S_VERDE:
                    this_aspect=S_VERDE;
                    break;
                case S_GAL_CL:
                    this_aspect=S_VERDE;
                    break;
                case S_GAL_DCL:
                    this_aspect=S_VERDE;
                    break;
                case S_VER_CL:
                    this_aspect=S_VERDE;
                    break;
                case S_GAL_GAL:
                    this_aspect=S_GAL_CL;
                    break;
                case S_VER_GAL:
                    this_aspect=S_GAL_CL;
                    break;
                case S_GAL_GAL_60:
                    this_aspect=S_GAL_CL;
                    break;
                case S_VER_GAL_60:
                    this_aspect=S_GAL_CL;
                    break;
                case S_GAL_GAL_90:
                    this_aspect=S_GAL_CL;
                    break;
                case S_VER_GAL_90:
                    this_aspect=S_GAL_CL;
                    break;
                case S_ALB:
                    this_aspect=S_GALBEN;
                    break;
                case S_ALB_CL:
                    this_aspect=S_GALBEN;
                    break;
                case S_BLOC_INVERS:
                    this_aspect=S_VERDE;
                    break;
                default:
                    this_aspect = S_GALBEN;
                    break;
                }

                if (next_aspect >= 100)
                    this_aspect = S_VERDE;

                if (has_direction)
                {
                    // Lipsa distantei de franare este indicata doar daca urmeaza oprire.
                    if (direction == 27 and this_aspect > 1)
                        direction = 0;
                    LightDirection(direction);
                }

                switch (restriction)
                {
                case R_30:
                    if (this_aspect > 1)
                    this_aspect = S_VERDE;
                    this_aspect = this_aspect + 6;
                    break;

                case R_60:
                    if (this_aspect > 1)
                    this_aspect = S_VERDE;
                    switch (has_bar)
                    {
                    case 0:
                        this_aspect = this_aspect + 6;
                        break;
                    case 1:
                        this_aspect = this_aspect + 12;
                        break;
                    case 2:
                        this_aspect = this_aspect + 6;
                        break;
                    case 3:
                        this_aspect = this_aspect + 12;
                        break;
                    default:;
                    }
                    break;

                case R_90:
                    if (this_aspect > 1)
                    this_aspect = S_VERDE;
                    switch (has_bar)
                    {
                    case 0:
                        this_aspect = this_aspect + 6;
                        break;
                    case 1:
                        this_aspect = this_aspect + 6;
                        break;
                    case 2:
                        this_aspect = this_aspect + 18;
                        break;
                    case 3:
                        this_aspect = this_aspect + 18;
                        break;
                    default:;
                    }
                    break;

                case R_MANEVRA:
                    this_aspect = S_ALB;
                    break;

                case R_CHEMARE:
                    this_aspect = S_ALB_CL;
                    break;
                default:;
                }

                if (this_aspect != memo_aspect)
                {
                    memo_aspect = this_aspect;
                    LightsOff();
                    Notify();

                    LightStanga(ies_st);

                    switch (this_aspect)
                    {
                    case S_GALBEN:
                        SetFXAttachment(B_GALBEN, galben);
                        break;
                    case S_VERDE:
                        SetFXAttachment(B_VERDE, verde);
                        break;
                    case S_GAL_CL:
                        SetFXAttachment(B_GALBEN, galbenclipitor);
                        break;
                    case S_GAL_GAL:
                        SetFXAttachment(B_GALBEN, galben);
                        SetFXAttachment(B_GAL_JOS, galben);
                        SetSpeedLimit(30/3.6);
                        break;
                    case S_VER_GAL:
                        SetFXAttachment(B_VERDE, verde);
                        SetFXAttachment(B_GAL_JOS, galben);
                        SetSpeedLimit(30/3.6);
                        break;
                    case S_GAL_GAL_60:
                        SetFXAttachment(B_GALBEN, galben);
                        SetFXAttachment(B_GAL_JOS, galben);
                        LightBar(restriction);
                        SetSpeedLimit(60/3.6);
                        break;
                    case S_VER_GAL_60:
                        SetFXAttachment(B_VERDE, verde);
                        SetFXAttachment(B_GAL_JOS, galben);
                        LightBar(restriction);
                        SetSpeedLimit(60/3.6);
                        break;
                    case S_GAL_GAL_90:
                        SetFXAttachment(B_GALBEN, galben);
                        SetFXAttachment(B_GAL_JOS, galben);
                        LightBar(restriction);
                        SetSpeedLimit(90/3.6);
                        break;
                    case S_VER_GAL_90:
                        SetFXAttachment(B_VERDE, verde);
                        SetFXAttachment(B_GAL_JOS, galben);
                        LightBar(restriction);
                        SetSpeedLimit(90/3.6);
                        break;
                    case S_ALB:
                        SetFXAttachment(B_ALB, alb);
                        SetSpeedLimit(20/3.6);
                        break;
                    case S_ALB_CL:
                        SetFXAttachment(B_CHEMARE, albclipitor);
                        SetFXAttachment(B_ROSU, rosu);
                        SetSpeedLimit(20/3.6);
                        break;
                    default:
                        break;
                    }
                }
            }
        }

        // BLA 3i sau 4i
        if (is_bla or is_bla4i)
        {
            // AVARIE
            if (is_avarie and special_restrict == S_ROSU)
            {
                this_aspect = S_ROSU;
                if (this_aspect != memo_aspect)
                {
                    memo_aspect = this_aspect;
                    Notify();
                    LightsOff();
                    SetFXAttachment(B_ROSU_AV, rosu);
                    //SetSignalState(null, RED, "Avarie la trecerea la nivel");
                }
            }
            else if (GetBLASignalState() == S_BLOC_INVERS)
            {
                this_aspect = S_BLOC_INVERS;
                if (this_aspect != memo_aspect)
                {
                    Notify();
                    memo_aspect = S_BLOC_INVERS;
                    LightsOff();
                    SetFXAttachment(B_ROSU, rosu);
                }
            }
            else if (GetBLASignalState() == RED or (next_aspect == AUTOMATIC))
            {
                this_aspect = S_ROSU;
                if (this_aspect != memo_aspect)
                {
                    memo_aspect = this_aspect;
                    Notify();
                    LightsOff();
                    SetFXAttachment(B_ROSU, rosu);
                }
            }
            else
            {
                switch (next_aspect)
                {
                case S_ROSU:
                    this_aspect = S_GALBEN;
                    break;
                case S_GALBEN:
                    this_aspect = S_VERDE;
                    if (is_bla4i)
                        this_aspect = S_VER_CL;
                    break;
                case S_VERDE:
                    this_aspect = S_VERDE;
                    break;
                case S_GAL_CL:
                    this_aspect = S_VERDE;
                    break;
                case S_GAL_DCL:
                    this_aspect = S_VERDE;
                    break;
                case S_VER_CL:
                    this_aspect = S_VERDE;
                    break;
                case S_GAL_GAL:
                    this_aspect = S_GAL_CL;
                    break;
                case S_VER_GAL:
                    this_aspect = S_GAL_CL;
                    break;
                case S_GAL_GAL_60:
                    this_aspect = S_GAL_DCL;
                    break;
                case S_VER_GAL_60:
                    this_aspect = S_GAL_DCL;
                    break;
                case S_GAL_GAL_90:
                    this_aspect = S_VER_CL;
                    break;
                case S_VER_GAL_90:
                    this_aspect = S_VER_CL;
                    break;
                case S_ALB:
                    this_aspect = S_VERDE;
                    break;
                case S_ALB_CL:
                    this_aspect = S_GALBEN;
                    break;
                default:
                    this_aspect = S_GALBEN;
                    break;
                }

                if (next_aspect >= 100) // Daca urmatorul e TMV
                    this_aspect = S_VERDE;

                if (this_aspect != memo_aspect)
                {
                    Notify();
                    memo_aspect = this_aspect;
                    LightsOff();
                    switch (this_aspect)
                    {
                    case S_GALBEN:
                        SetFXAttachment(B_GALBEN, galben);
                        break;
                    case S_VERDE:
                        SetFXAttachment(B_VERDE, verde);
                        break;
                    case S_GAL_CL:
                        SetFXAttachment(B_GALBEN, galbenclipitor);
                        break;
                    case S_GAL_DCL:
                        SetFXAttachment(B_GALBEN, galbenclipitor2);
                        break;
                    case S_VER_CL:
                        SetFXAttachment(B_VERDE, verdeclipitor);
                        break;
                    default:;
                    }
                }
            }
        }

        // PREVESTITOR
        if (is_prevestitor)
        {
            switch (next_aspect)
            {
            case S_ROSU:
                this_aspect=S_GALBEN;
                break;
            case S_GALBEN:
                this_aspect=S_VERDE;
                break;
            case S_VERDE:
                this_aspect=S_VERDE;
                break;
            case S_GAL_CL:
                this_aspect=S_VERDE;
                break;
            case S_GAL_DCL:
                this_aspect=S_VERDE;
                break;
            case S_VER_CL:
                this_aspect=S_VERDE;
                break;
            case S_GAL_GAL:
                this_aspect=S_GAL_CL;
                break;
            case S_VER_GAL:
                this_aspect=S_GAL_CL;
                break;
            case S_GAL_GAL_60:
                this_aspect=S_GAL_CL;
                break;
            case S_VER_GAL_60:
                this_aspect=S_GAL_CL;
                break;
            case S_GAL_GAL_90:
                this_aspect=S_GAL_CL;
                break;
            case S_VER_GAL_90:
                this_aspect=S_GAL_CL;
                break;
            case S_ALB:
                this_aspect=S_VERDE;
                break;
            case S_ALB_CL:
                this_aspect=S_GALBEN;
                break;
            default:
                this_aspect = S_GALBEN;
                break;
            }

            if (next_aspect >= 100)
                this_aspect = S_VERDE;

            if (this_aspect != memo_aspect)
            {
                Notify();
                memo_aspect = this_aspect;
                LightsOff();
                switch (this_aspect)
                {
                case S_GALBEN:
                    SetFXAttachment(B_GALBEN, galben);
                    break;
                case S_VERDE:
                    SetFXAttachment(B_VERDE, verde);
                    break;
                case S_GAL_CL:
                    SetFXAttachment(B_GALBEN, galbenclipitor);
                    break;
                default:;
                }
            }
        }

        if (is_repetitor)
        {
            UpdateRepetitor();
        }
        else if (is_manevra and !(is_intrare or is_iesire or is_triere))
        {
            UpdateManevra();
        }
        else if (is_avarie and !(is_bla or is_bla4i))
        {
            UpdateAvarie();
        }
    }

    //
    // Update MEC Signal State
    //
    thread void UpdateMEC()
    {
        // INTRARE si IESIRE 1i
        if ((is_intrare or is_iesire) and (lights_count == 1))
        {
            if (GetSignalState()==RED)
            {
                this_aspect = S_ROSU;
                if (this_aspect != memo_aspect)
                {
                    Notify();
                    memo_aspect = this_aspect;
                    LightsOff();
                    SetFXCoronaTexture(B_ROSU, rosu);
                    SetMeshAnimationFrame("default", 0, 1);
                }
            }
            else
            {
                this_aspect = S_VERDE;
                if (this_aspect != memo_aspect)
                {
                    Notify();
                    memo_aspect = this_aspect;
                    LightsOff();
                    SetMeshAnimationFrame("default", 30, 1);
                    SetFXCoronaTexture(B_ROSU, verde);
                }
            }
        }

        // INTRARE si IESIRE 2i
        if ((is_intrare or is_iesire) and (lights_count == 2))
        {
            if (GetSignalState() == RED or (next_aspect == AUTOMATIC))
            {
                this_aspect = S_ROSU;
                if (this_aspect != memo_aspect)
                {
                    Notify();
                    memo_aspect = this_aspect;
                    LightsOff();
                    SetFXCoronaTexture(B_ROSU, rosu);
                    SetMeshAnimationFrame("default", 60, 1);
                }
            }
            else
            {
                FindMarker();

                if (restriction==R_30)
                    this_aspect=S_VER_GAL;
                else
                    this_aspect=S_VERDE;

                if (this_aspect!=memo_aspect)
                {
                    Notify();
                    memo_aspect=this_aspect;
                    LightsOff();

                    if (this_aspect==S_VER_GAL)
                    {
                        SetMeshAnimationFrame("default",90,1);
                        SetFXCoronaTexture(B_ROSU,verde);
                        SetFXCoronaTexture(B_GALBEN,galben);
                    }
                    else
                    {
                        SetMeshAnimationFrame("default",30,1);
                        SetFXCoronaTexture(B_ROSU,verde);
                    }
                }
            }
        }

        // INTRARE si IESIRE 3i
        if ((is_intrare or is_iesire) and (lights_count == 3))
        {
            if (GetSignalState()==RED)
            {
                this_aspect=S_ROSU;
                if (this_aspect!=memo_aspect)
                {
                    Notify();
                    memo_aspect=this_aspect;
                    LightsOff();
                    SetFXCoronaTexture(B_ROSU,rosu);
                    SetFXCoronaTexture(B_GAL_JOS,galben);
                    SetMeshAnimationFrame("default",60,1);
                    SetMeshAnimationFrame("paleta",0,2);
                }
            }
            else
            {
                switch (next_aspect)
                {
                case S_ROSU:
                    this_aspect=S_GALBEN;
                    break;
                case S_GALBEN:
                    this_aspect=S_VERDE;
                    break;
                case S_VERDE:
                    this_aspect=S_VERDE;
                    break;
                case S_GAL_CL:
                    this_aspect=S_VERDE;
                    break;
                case S_GAL_DCL:
                    this_aspect=S_VERDE;
                    break;
                case S_VER_CL:
                    this_aspect=S_VERDE;
                    break;
                case S_GAL_GAL:
                    this_aspect=S_VERDE;
                    break;
                case S_VER_GAL:
                    this_aspect=S_VERDE;
                    break;
                case S_GAL_GAL_60:
                    this_aspect=S_VERDE;
                    break;
                case S_VER_GAL_60:
                    this_aspect=S_VERDE;
                    break;
                case S_GAL_GAL_90:
                    this_aspect=S_VERDE;
                    break;
                case S_VER_GAL_90:
                    this_aspect=S_VERDE;
                    break;
                case S_ALB:
                    this_aspect=S_VERDE;
                    break;
                case S_ALB_CL:
                    this_aspect=S_GALBEN;
                    break;
                case S_BLOC_INVERS:
                    this_aspect=S_VERDE;
                    break;
                default:;
                }

                if (next_aspect>=100)
                    this_aspect=S_VERDE;

                FindMarker();

                if (restriction==R_30)
                {
                    if (this_aspect>1)
                        this_aspect=S_VERDE;
                    this_aspect = this_aspect + 6;
                }

                if (this_aspect!=memo_aspect)
                {
                    Notify();
                    memo_aspect=this_aspect;
                    LightsOff();

                    switch (this_aspect)
                    {
                    case S_GALBEN:
                        SetFXCoronaTexture(B_ROSU,verde);
                        SetFXCoronaTexture(B_GAL_JOS,galben);
                        SetMeshAnimationFrame("default",30,1);
                        SetMeshAnimationFrame("paleta",0,2);
                        break;
                    case S_VERDE:
                        SetFXCoronaTexture(B_ROSU,verde);
                        SetFXCoronaTexture(B_GAL_JOS,verde);
                        SetMeshAnimationFrame("default",30,1);
                        SetMeshAnimationFrame("paleta",120,2);
                        break;
                    case S_GAL_GAL:
                        SetFXCoronaTexture(B_ROSU,verde);
                        SetFXCoronaTexture(B_GALBEN,galben);
                        SetFXCoronaTexture(B_GAL_JOS,galben);
                        SetMeshAnimationFrame("default",90,1);
                        SetMeshAnimationFrame("paleta",0,2);
                        SetSpeedLimit(30/3.6);
                        break;
                    case S_VER_GAL:
                        SetFXCoronaTexture(B_ROSU,verde);
                        SetFXCoronaTexture(B_GALBEN,galben);
                        SetFXCoronaTexture(B_GAL_JOS,verde);
                        SetMeshAnimationFrame("default",90,1);
                        SetMeshAnimationFrame("paleta",120,2);
                        SetSpeedLimit(30/3.6);
                        break;
                    default:;
                    }
                }
            }
        }

        // PREVESTITOR 2i
        if (is_prevestitor and lights_count == 1)
        {
            switch (next_aspect)
            {
            case S_ROSU:
                this_aspect=S_GALBEN;
                break;
            case S_GALBEN:
                this_aspect=S_VERDE;
                break;
            case S_VERDE:
                this_aspect=S_VERDE;
                break;
            case S_GAL_CL:
                this_aspect=S_VERDE;
                break;
            case S_GAL_DCL:
                this_aspect=S_VERDE;
                break;
            case S_VER_CL:
                this_aspect=S_VERDE;
                break;
            case S_GAL_GAL:
                this_aspect=S_GALBEN;
                break;
            case S_VER_GAL:
                this_aspect=S_GALBEN;
                break;
            case S_GAL_GAL_60:
                this_aspect=S_GALBEN;
                break;
            case S_VER_GAL_60:
                this_aspect=S_GALBEN;
                break;
            case S_GAL_GAL_90:
                this_aspect=S_GALBEN;
                break;
            case S_VER_GAL_90:
                this_aspect=S_GALBEN;
                break;
            case S_ALB:
                this_aspect=S_VERDE;
                break;
            case S_ALB_CL:
                this_aspect=S_GALBEN;
                break;
            default:;
            }

            if (next_aspect>=100)
                this_aspect=S_VERDE;

            if (this_aspect != memo_aspect)
            {
                Notify();
                memo_aspect = this_aspect;
                LightsOff();

                switch (this_aspect)
                {
                case S_GALBEN:
                    SetMeshAnimationFrame("default",0,2);
                    SetFXCoronaTexture(B_GALBEN,galben);
                    break;
                case S_VERDE:
                    SetMeshAnimationFrame("default",120,2);
                    SetFXCoronaTexture(B_GALBEN,verde);
                    break;
                default:;
                }
            }
        }

        // PREVESTITOR 3i
        if (is_prevestitor and lights_count == 2)
        {
            switch (next_aspect)
            {
            case S_ROSU:
                this_aspect=S_GALBEN;
                break;
            case S_GALBEN:
                this_aspect=S_VERDE;
                break;
            case S_VERDE:
                this_aspect=S_VERDE;
                break;
            case S_GAL_CL:
                this_aspect=S_VERDE;
                break;
            case S_GAL_DCL:
                this_aspect=S_VERDE;
                break;
            case S_VER_CL:
                this_aspect=S_VERDE;
                break;
            case S_GAL_GAL:
                this_aspect=S_GAL_GAL;
                break;
            case S_VER_GAL:
                this_aspect=S_GAL_GAL;
                break;
            case S_GAL_GAL_60:
                this_aspect=S_GAL_GAL;
                break;
            case S_VER_GAL_60:
                this_aspect=S_GAL_GAL;
                break;
            case S_GAL_GAL_90:
                this_aspect=S_GAL_GAL;
                break;
            case S_VER_GAL_90:
                this_aspect=S_GAL_GAL;
                break;
            case S_ALB:
                this_aspect=S_VERDE;
                break;
            case S_ALB_CL:
                this_aspect=S_GALBEN;
                break;
            default:;
            }

            if (next_aspect>=100)
                this_aspect=S_VERDE;

            if (this_aspect!=memo_aspect)
            {
                Notify();
                memo_aspect=this_aspect;
                LightsOff();
                switch (this_aspect)
                {
                case S_GALBEN:
                    SetMeshAnimationFrame("default",0,2);
                    if (signal_type == "MEC")
                        SetMeshAnimationFrame("paleta",60,1);
                    else if (signal_type == "MEC_DR")
                        SetMeshAnimationState("paleta", false);
                    SetFXCoronaTexture(B_GALBEN,galben);
                    break;
                case S_VERDE:
                    SetMeshAnimationFrame("default",120,2);
                    if (signal_type == "MEC")
                        SetMeshAnimationFrame("paleta",60,1);
                    else if (signal_type == "MEC_DR")
                        SetMeshAnimationState("paleta", false);
                    SetFXCoronaTexture(B_GALBEN,verde);
                    break;
                case S_GAL_GAL:
                    SetMeshAnimationFrame("default",0,2);
                    if (signal_type == "MEC")
                        SetMeshAnimationFrame("paleta",90,1);
                    else if (signal_type == "MEC_DR")
                        SetMeshAnimationState("paleta", true);
                    SetFXCoronaTexture(B_GALBEN,galben);
                    SetFXCoronaTexture(B_GAL_JOS,galben);
                    break;
                default:;
                }
            }
        }

        if (is_repetitor)
        {
            UpdateRepetitor();
        }
        else if (is_manevra and !(is_intrare or is_iesire or is_triere))
        {
            UpdateManevra();
        }
    }

    //
    // Update TMV Signal State
    //
    thread void UpdateTMV()
    {
        // INTRARE si IESIRE
        if (is_intrare or is_iesire)
        {
            int restriction = FindMarker();
            FindMarkerLinie();

            // CHEMARE
            if (is_chemare and (special_restrict == S_ALB_CL or restriction == R_CHEMARE))
            {
                this_aspect=S_ALB_CL;
                if (this_aspect!=memo_aspect)
                {
                    memo_aspect=this_aspect;
                    Notify();
                    LightsOff();
                    LightThisLimit(0);
                    LightNextLimit(0);
                    LightDirection(0);
                    LightLinie(0);

                    SetFXAttachment(B_CHEMARE, albclipitor);
                    SetFXAttachment(B_ROSU, rosu);
                    SetSpeedLimit(20/3.6);
                    //SetSignalState(null, GREEN, "Depășire permisă");
                }
            } // MANEVRA
            else if (is_manevra and (special_restrict == S_ALB or restriction == R_MANEVRA))
            {
                this_aspect=S_ALB;
                if (this_aspect!=memo_aspect)
                {
                    memo_aspect=this_aspect;
                    Notify();
                    LightsOff();
                    LightThisLimit(R_T20);
                    LightNextLimit(0);
                    LightDirection(0);
                    LightLinie(0);

                    SetFXAttachment(B_ALB, alb);
                    SetSpeedLimit(20/3.6);
                    //SetSignalState(null, GREEN, "Manevra permisă");
                }
            }
            else if (GetSignalState() == RED or (next_aspect == AUTOMATIC))
            {
                this_aspect=S_ROSU;
                if (this_aspect!=memo_aspect)
                {
                    Notify();
                    memo_aspect=this_aspect;
                    LightsOff();
                    LightThisLimit(0);
                    LightNextLimit(0);
                    LightDirection(0);
                    LightLinie(0);

                    SetFXAttachment(B_ROSU,rosu);
                }
            }
            else
            {
                switch (next_aspect)
                {
                case S_ROSU:
                    switch (restriction)
                    {
                    case R_T20:
                        this_aspect=101;
                        next_restrict=R_VS;
                        break;
                    case R_T30:
                        this_aspect=102;
                        next_restrict=R_VS;
                        break;
                    case R_T60:
                        this_aspect=103;
                        next_restrict=R_VS;
                        break;
                    case R_T80:
                        this_aspect=104;
                        next_restrict=R_VS;
                        break;
                    case R_T90:
                        this_aspect=105;
                        next_restrict=R_VS;
                        break;
                    case R_T100:
                        this_aspect=106;
                        next_restrict=R_VS;
                        break;
                    case R_TVS:
                        this_aspect=T_GALBEN;
                        next_restrict=R_VS;
                        break;
                    default:;
                    }
                    break;
                case 1:
                    switch (restriction)
                    {
                    case 4:
                        this_aspect=115;
                        next_restrict=R_VS;
                        break;
                    case 5:
                        this_aspect=116;
                        next_restrict=R_VS;
                        break;
                    case 6:
                        this_aspect=117;
                        next_restrict=R_VS;
                        break;
                    case 7:
                        this_aspect=118;
                        next_restrict=R_VS;
                        break;
                    case 8:
                        this_aspect=119;
                        next_restrict=R_VS;
                        break;
                    case 9:
                        this_aspect=120;
                        next_restrict=R_VS;
                        break;
                    case 10:
                        this_aspect=T_VER_CL;
                        next_restrict=R_VS;
                        break;
                    default:;
                    }
                    break;
                case 2:
                    switch (restriction)
                    {
                    case 4:
                        this_aspect=115;
                        next_restrict=R_VS;
                        break;
                    case 5:
                        this_aspect=116;
                        next_restrict=R_VS;
                        break;
                    case 6:
                        this_aspect=117;
                        next_restrict=R_VS;
                        break;
                    case 7:
                        this_aspect=118;
                        next_restrict=R_VS;
                        break;
                    case 8:
                        this_aspect=119;
                        next_restrict=R_VS;
                        break;
                    case 9:
                        this_aspect=120;
                        next_restrict=R_VS;
                        break;
                    case 10:
                        this_aspect=T_VERDE;
                        next_restrict=R_VS;
                        break;
                    default:;
                    }
                    break;
                case 3:
                    switch (restriction)
                    {
                    case 4:
                        this_aspect=115;
                        next_restrict=R_VS;
                        break;
                    case 5:
                        this_aspect=116;
                        next_restrict=R_VS;
                        break;
                    case 6:
                        this_aspect=117;
                        next_restrict=R_VS;
                        break;
                    case 7:
                        this_aspect=118;
                        next_restrict=R_VS;
                        break;
                    case 8:
                        this_aspect=119;
                        next_restrict=R_VS;
                        break;
                    case 9:
                        this_aspect=120;
                        next_restrict=R_VS;
                        break;
                    case 10:
                        this_aspect=T_VERDE;
                        next_restrict=R_VS;
                        break;
                    default:;
                    }
                    break;
                case 4:
                    switch (restriction)
                    {
                    case 4:
                        this_aspect=115;
                        next_restrict=R_VS;
                        break;
                    case 5:
                        this_aspect=116;
                        next_restrict=R_VS;
                        break;
                    case 6:
                        this_aspect=117;
                        next_restrict=R_VS;
                        break;
                    case 7:
                        this_aspect=118;
                        next_restrict=R_VS;
                        break;
                    case 8:
                        this_aspect=119;
                        next_restrict=R_VS;
                        break;
                    case 9:
                        this_aspect=120;
                        next_restrict=R_VS;
                        break;
                    case 10:
                        this_aspect=T_VERDE;
                        next_restrict=R_VS;
                        break;
                    default:;
                    }
                    break;
                case 6:
                    switch (restriction)
                    {
                    case 4:
                        this_aspect=115;
                        next_restrict=R_VS;
                        break;
                    case 5:
                        this_aspect=116;
                        next_restrict=R_VS;
                        break;
                    case 6:
                        this_aspect=117;
                        next_restrict=R_VS;
                        break;
                    case 7:
                        this_aspect=118;
                        next_restrict=R_VS;
                        break;
                    case 8:
                        this_aspect=119;
                        next_restrict=R_VS;
                        break;
                    case 9:
                        this_aspect=120;
                        next_restrict=R_VS;
                        break;
                    case 10:
                        this_aspect=T_VERDE;
                        next_restrict=R_VS;
                        break;
                    default:;
                    }
                    break;
                case 7:
                    switch (restriction)
                    {
                    case 4:
                        this_aspect=115;
                        next_restrict=R_VS;
                        break;
                    case 5:
                        this_aspect=116;
                        next_restrict=R_VS;
                        break;
                    case 6:
                        this_aspect=110;
                        next_restrict=5;
                        break;
                    case 7:
                        this_aspect=111;
                        next_restrict=5;
                        break;
                    case 8:
                        this_aspect=112;
                        next_restrict=5;
                        break;
                    case 9:
                        this_aspect=113;
                        next_restrict=5;
                        break;
                    case 10:
                        this_aspect=T_VER_CL;
                        next_restrict=5;
                        break;
                    default:;
                    }
                    break;
                case 8:
                    switch (restriction)
                    {
                    case 4:
                        this_aspect=115;
                        next_restrict=R_VS;
                        break;
                    case 5:
                        this_aspect=116;
                        next_restrict=R_VS;
                        break;
                    case 6:
                        this_aspect=110;
                        next_restrict=5;
                        break;
                    case 7:
                        this_aspect=111;
                        next_restrict=5;
                        break;
                    case 8:
                        this_aspect=112;
                        next_restrict=5;
                        break;
                    case 9:
                        this_aspect=113;
                        next_restrict=5;
                        break;
                    case 10:
                        this_aspect=T_VER_CL;
                        next_restrict=5;
                        break;
                    default:;
                    }
                    break;
                case 13:
                    switch (restriction)
                    {
                    case 4:
                        this_aspect=115;
                        next_restrict=R_VS;
                        break;
                    case 5:
                        this_aspect=116;
                        next_restrict=R_VS;
                        break;
                    case 6:
                        this_aspect=117;
                        next_restrict=R_VS;
                        break;
                    case 7:
                        this_aspect=111;
                        next_restrict=6;
                        break;
                    case 8:
                        this_aspect=112;
                        next_restrict=6;
                        break;
                    case 9:
                        this_aspect=113;
                        next_restrict=6;
                        break;
                    case 10:
                        this_aspect=T_VER_CL;
                        next_restrict=6;
                        break;
                    default:;
                    }
                    break;
                case 14:
                    switch (restriction)
                    {
                    case 4:
                        this_aspect=115;
                        next_restrict=R_VS;
                        break;
                    case 5:
                        this_aspect=116;
                        next_restrict=R_VS;
                        break;
                    case 6:
                        this_aspect=117;
                        next_restrict=R_VS;
                        break;
                    case 7:
                        this_aspect=111;
                        next_restrict=6;
                        break;
                    case 8:
                        this_aspect=112;
                        next_restrict=6;
                        break;
                    case 9:
                        this_aspect=113;
                        next_restrict=6;
                        break;
                    case 10:
                        this_aspect=T_VER_CL;
                        next_restrict=6;
                        break;
                    default:;
                    }
                    break;
                case 19:
                    switch (restriction)
                    {
                    case 4:
                        this_aspect=115;
                        next_restrict=R_VS;
                        break;
                    case 5:
                        this_aspect=116;
                        next_restrict=R_VS;
                        break;
                    case 6:
                        this_aspect=117;
                        next_restrict=R_VS;
                        break;
                    case 7:
                        this_aspect=118;
                        next_restrict=R_VS;
                        break;
                    case 8:
                        this_aspect=119;
                        next_restrict=R_VS;
                        break;
                    case 9:
                        this_aspect=113;
                        next_restrict=8;
                        break;
                    case 10:
                        this_aspect=T_VER_CL;
                        next_restrict=8;
                        break;
                    default:;
                    }
                    break;
                case 20:
                    switch (restriction)
                    {
                    case 4:
                        this_aspect=115;
                        next_restrict=R_VS;
                        break;
                    case 5:
                        this_aspect=116;
                        next_restrict=R_VS;
                        break;
                    case 6:
                        this_aspect=117;
                        next_restrict=R_VS;
                        break;
                    case 7:
                        this_aspect=118;
                        next_restrict=R_VS;
                        break;
                    case 8:
                        this_aspect=119;
                        next_restrict=R_VS;
                        break;
                    case 9:
                        this_aspect=113;
                        next_restrict=8;
                        break;
                    case 10:
                        this_aspect=T_VER_CL;
                        next_restrict=8;
                        break;
                    default:;
                    }
                    break;
                case S_ALB:
                    this_aspect=T_VER_CL_20;
                    next_restrict=R_T20;
                    break;
                case S_ALB_CL:
                    this_aspect=T_GALBEN_20;
                    next_restrict=R_T20;
                    break;
                case 100:
                    switch (restriction)
                    {
                    case 4:
                        this_aspect=115;
                        next_restrict=R_VS;
                        break;
                    case 5:
                        this_aspect=116;
                        next_restrict=R_VS;
                        break;
                    case 6:
                        this_aspect=117;
                        next_restrict=R_VS;
                        break;
                    case 7:
                        this_aspect=118;
                        next_restrict=R_VS;
                        break;
                    case 8:
                        this_aspect=119;
                        next_restrict=R_VS;
                        break;
                    case 9:
                        this_aspect=120;
                        next_restrict=R_VS;
                        break;
                    case 10:
                        this_aspect=T_VER_CL;
                        next_restrict=R_VS;
                        break;
                    default:;
                    }
                    break;
                case 101:
                    switch (restriction) {
                    case 4:
                        this_aspect=115;
                        next_restrict=R_VS;
                        break;
                    case 5:
                        this_aspect=109;
                        next_restrict=4;
                        break;
                    case 6:
                        this_aspect=110;
                        next_restrict=4;
                        break;
                    case 7:
                        this_aspect=111;
                        next_restrict=4;
                        break;
                    case 8:
                        this_aspect=112;
                        next_restrict=4;
                        break;
                    case 9:
                        this_aspect=113;
                        next_restrict=4;
                        break;
                    case 10:
                        this_aspect=T_VER_CL;
                        next_restrict=4;
                        break;
                    default:;
                    }
                    break;
                case 102:
                    switch (restriction) {
                    case 4:
                        this_aspect=115;
                        next_restrict=R_VS;
                        break;
                    case 5:
                        this_aspect=116;
                        next_restrict=R_VS;
                        break;
                    case 6:
                        this_aspect=110;
                        next_restrict=5;
                        break;
                    case 7:
                        this_aspect=111;
                        next_restrict=5;
                        break;
                    case 8:
                        this_aspect=112;
                        next_restrict=5;
                        break;
                    case 9:
                        this_aspect=113;
                        next_restrict=5;
                        break;
                    case 10:
                        this_aspect=T_VER_CL;
                        next_restrict=5;
                        break;
                    default:;
                    }
                    break;
                case 103:
                    switch (restriction) {
                    case 4:
                        this_aspect=115;
                        next_restrict=R_VS;
                        break;
                    case 5:
                        this_aspect=116;
                        next_restrict=R_VS;
                        break;
                    case 6:
                        this_aspect=117;
                        next_restrict=R_VS;
                        break;
                    case 7:
                        this_aspect=111;
                        next_restrict=6;
                        break;
                    case 8:
                        this_aspect=112;
                        next_restrict=6;
                        break;
                    case 9:
                        this_aspect=113;
                        next_restrict=6;
                        break;
                    case 10:
                        this_aspect=T_VER_CL;
                        next_restrict=6;
                        break;
                    default:;
                    }
                    break;
                case 104:
                    switch (restriction) {
                    case 4:
                        this_aspect=115;
                        next_restrict=R_VS;
                        break;
                    case 5:
                        this_aspect=116;
                        next_restrict=R_VS;
                        break;
                    case 6:
                        this_aspect=117;
                        next_restrict=R_VS;
                        break;
                    case 7:
                        this_aspect=118;
                        next_restrict=R_VS;
                        break;
                    case 8:
                        this_aspect=112;
                        next_restrict=7;
                        break;
                    case 9:
                        this_aspect=113;
                        next_restrict=7;
                        break;
                    case 10:
                        this_aspect=T_VER_CL;
                        next_restrict=7;
                        break;
                    default:;
                    }
                    break;
                case 105:
                    switch (restriction) {
                    case 4:
                        this_aspect=115;
                        next_restrict=R_VS;
                        break;
                    case 5:
                        this_aspect=116;
                        next_restrict=R_VS;
                        break;
                    case 6:
                        this_aspect=117;
                        next_restrict=R_VS;
                        break;
                    case 7:
                        this_aspect=118;
                        next_restrict=R_VS;
                        break;
                    case 8:
                        this_aspect=119;
                        next_restrict=R_VS;
                        break;
                    case 9:
                        this_aspect=113;
                        next_restrict=8;
                        break;
                    case 10:
                        this_aspect=T_VER_CL;
                        next_restrict=8;
                        break;
                    default:;
                    }
                    break;
                case 106:
                    switch (restriction) {
                    case 4:
                        this_aspect=115;
                        next_restrict=R_VS;
                        break;
                    case 5:
                        this_aspect=116;
                        next_restrict=R_VS;
                        break;
                    case 6:
                        this_aspect=117;
                        next_restrict=R_VS;
                        break;
                    case 7:
                        this_aspect=118;
                        next_restrict=R_VS;
                        break;
                    case 8:
                        this_aspect=119;
                        next_restrict=R_VS;
                        break;
                    case 9:
                        this_aspect=120;
                        next_restrict=R_VS;
                        break;
                    case 10:
                        this_aspect=T_VER_CL;
                        next_restrict=9;
                        break;
                    default:;
                    }
                    break;
                case 107:
                    switch (restriction) {
                    case 4:
                        this_aspect=115;
                        next_restrict=R_VS;
                        break;
                    case 5:
                        this_aspect=116;
                        next_restrict=R_VS;
                        break;
                    case 6:
                        this_aspect=117;
                        next_restrict=R_VS;
                        break;
                    case 7:
                        this_aspect=118;
                        next_restrict=R_VS;
                        break;
                    case 8:
                        this_aspect=119;
                        next_restrict=R_VS;
                        break;
                    case 9:
                        this_aspect=120;
                        next_restrict=R_VS;
                        break;
                    case 10:
                        this_aspect=T_VERDE;
                        next_restrict=R_VS;
                        break;
                    default:;
                    }
                    break;
                case 108:
                    switch (restriction) {
                    case 4:
                        this_aspect=115;
                        next_restrict=R_VS;
                        break;
                    case 5:
                        this_aspect=109;
                        next_restrict=4;
                        break;
                    case 6:
                        this_aspect=110;
                        next_restrict=4;
                        break;
                    case 7:
                        this_aspect=111;
                        next_restrict=4;
                        break;
                    case 8:
                        this_aspect=112;
                        next_restrict=4;
                        break;
                    case 9:
                        this_aspect=113;
                        next_restrict=4;
                        break;
                    case 10:
                        this_aspect=T_VER_CL;
                        next_restrict=4;
                        break;
                    default:;
                    }
                    break;
                case 109:
                    switch (restriction) {
                    case 4:
                        this_aspect=115;
                        next_restrict=R_VS;
                        break;
                    case 5:
                        this_aspect=116;
                        next_restrict=R_VS;
                        break;
                    case 6:
                        this_aspect=110;
                        next_restrict=5;
                        break;
                    case 7:
                        this_aspect=111;
                        next_restrict=5;
                        break;
                    case 8:
                        this_aspect=112;
                        next_restrict=5;
                        break;
                    case 9:
                        this_aspect=113;
                        next_restrict=5;
                        break;
                    case 10:
                        this_aspect=T_VER_CL;
                        next_restrict=5;
                        break;
                    default:;
                    }
                    break;
                case 110:
                    switch (restriction) {
                    case 4:
                        this_aspect=115;
                        next_restrict=R_VS;
                        break;
                    case 5:
                        this_aspect=116;
                        next_restrict=R_VS;
                        break;
                    case 6:
                        this_aspect=117;
                        next_restrict=R_VS;
                        break;
                    case 7:
                        this_aspect=111;
                        next_restrict=6;
                        break;
                    case 8:
                        this_aspect=112;
                        next_restrict=6;
                        break;
                    case 9:
                        this_aspect=113;
                        next_restrict=6;
                        break;
                    case 10:
                        this_aspect=T_VER_CL;
                        next_restrict=6;
                        break;
                    default:;
                    }
                    break;
                case 111:
                    switch (restriction) {
                    case 4:
                        this_aspect=115;
                        next_restrict=R_VS;
                        break;
                    case 5:
                        this_aspect=116;
                        next_restrict=R_VS;
                        break;
                    case 6:
                        this_aspect=117;
                        next_restrict=R_VS;
                        break;
                    case 7:
                        this_aspect=118;
                        next_restrict=R_VS;
                        break;
                    case 8:
                        this_aspect=112;
                        next_restrict=7;
                        break;
                    case 9:
                        this_aspect=113;
                        next_restrict=7;
                        break;
                    case 10:
                        this_aspect=T_VER_CL;
                        next_restrict=7;
                        break;
                    default:;
                    }
                    break;
                case 112:
                    switch (restriction) {
                    case 4:
                        this_aspect=115;
                        next_restrict=R_VS;
                        break;
                    case 5:
                        this_aspect=116;
                        next_restrict=R_VS;
                        break;
                    case 6:
                        this_aspect=117;
                        next_restrict=R_VS;
                        break;
                    case 7:
                        this_aspect=118;
                        next_restrict=R_VS;
                        break;
                    case 8:
                        this_aspect=119;
                        next_restrict=R_VS;
                        break;
                    case 9:
                        this_aspect=113;
                        next_restrict=8;
                        break;
                    case 10:
                        this_aspect=T_VER_CL;
                        next_restrict=8;
                        break;
                    default:;
                    }
                    break;
                case 113:
                    switch (restriction) {
                    case 4:
                        this_aspect=115;
                        next_restrict=R_VS;
                        break;
                    case 5:
                        this_aspect=116;
                        next_restrict=R_VS;
                        break;
                    case 6:
                        this_aspect=117;
                        next_restrict=R_VS;
                        break;
                    case 7:
                        this_aspect=118;
                        next_restrict=R_VS;
                        break;
                    case 8:
                        this_aspect=119;
                        next_restrict=R_VS;
                        break;
                    case 9:
                        this_aspect=120;
                        next_restrict=R_VS;
                        break;
                    case 10:
                        this_aspect=T_VER_CL;
                        next_restrict=9;
                        break;
                    default:;
                    }
                    break;
                case 114:
                    switch (restriction) {
                    case 4:
                        this_aspect=115;
                        next_restrict=R_VS;
                        break;
                    case 5:
                        this_aspect=116;
                        next_restrict=R_VS;
                        break;
                    case 6:
                        this_aspect=117;
                        next_restrict=R_VS;
                        break;
                    case 7:
                        this_aspect=118;
                        next_restrict=R_VS;
                        break;
                    case 8:
                        this_aspect=119;
                        next_restrict=R_VS;
                        break;
                    case 9:
                        this_aspect=120;
                        next_restrict=R_VS;
                        break;
                    case 10:
                        this_aspect=T_VERDE;
                        next_restrict=R_VS;
                        break;
                    default:;
                    }
                    break;
                case 115:
                    switch (restriction) {
                    case 4:
                        this_aspect=115;
                        next_restrict=R_VS;
                        break;
                    case 5:
                        this_aspect=109;
                        next_restrict=4;
                        break;
                    case 6:
                        this_aspect=110;
                        next_restrict=4;
                        break;
                    case 7:
                        this_aspect=111;
                        next_restrict=4;
                        break;
                    case 8:
                        this_aspect=112;
                        next_restrict=4;
                        break;
                    case 9:
                        this_aspect=113;
                        next_restrict=4;
                        break;
                    case 10:
                        this_aspect=T_VER_CL;
                        next_restrict=4;
                        break;
                    default:;
                    }
                    break;
                case 116:
                    switch (restriction) {
                    case 4:
                        this_aspect=115;
                        next_restrict=R_VS;
                        break;
                    case 5:
                        this_aspect=116;
                        next_restrict=R_VS;
                        break;
                    case 6:
                        this_aspect=110;
                        next_restrict=5;
                        break;
                    case 7:
                        this_aspect=111;
                        next_restrict=5;
                        break;
                    case 8:
                        this_aspect=112;
                        next_restrict=5;
                        break;
                    case 9:
                        this_aspect=113;
                        next_restrict=5;
                        break;
                    case 10:
                        this_aspect=T_VER_CL;
                        next_restrict=5;
                        break;
                    default:;
                    }
                    break;
                case 117:
                    switch (restriction) {
                    case 4:
                        this_aspect=115;
                        next_restrict=R_VS;
                        break;
                    case 5:
                        this_aspect=116;
                        next_restrict=R_VS;
                        break;
                    case 6:
                        this_aspect=117;
                        next_restrict=R_VS;
                        break;
                    case 7:
                        this_aspect=111;
                        next_restrict=6;
                        break;
                    case 8:
                        this_aspect=112;
                        next_restrict=6;
                        break;
                    case 9:
                        this_aspect=113;
                        next_restrict=6;
                        break;
                    case 10:
                        this_aspect=T_VER_CL;
                        next_restrict=6;
                        break;
                    default:;
                    }
                    break;
                case 118:
                    switch (restriction) {
                    case 4:
                        this_aspect=115;
                        next_restrict=R_VS;
                        break;
                    case 5:
                        this_aspect=116;
                        next_restrict=R_VS;
                        break;
                    case 6:
                        this_aspect=117;
                        next_restrict=R_VS;
                        break;
                    case 7:
                        this_aspect=118;
                        next_restrict=R_VS;
                        break;
                    case 8:
                        this_aspect=112;
                        next_restrict=7;
                        break;
                    case 9:
                        this_aspect=113;
                        next_restrict=7;
                        break;
                    case 10:
                        this_aspect=T_VER_CL;
                        next_restrict=7;
                        break;
                    default:;
                    }
                    break;
                case 119:
                    switch (restriction) {
                    case 4:
                        this_aspect=115;
                        next_restrict=R_VS;
                        break;
                    case 5:
                        this_aspect=116;
                        next_restrict=R_VS;
                        break;
                    case 6:
                        this_aspect=117;
                        next_restrict=R_VS;
                        break;
                    case 7:
                        this_aspect=118;
                        next_restrict=R_VS;
                        break;
                    case 8:
                        this_aspect=119;
                        next_restrict=R_VS;
                        break;
                    case 9:
                        this_aspect=113;
                        next_restrict=8;
                        break;
                    case 10:
                        this_aspect=T_VER_CL;
                        next_restrict=8;
                        break;
                    default:;
                    }
                    break;
                case 120:
                    switch (restriction)
                    {
                    case 4:
                        this_aspect=115;
                        next_restrict=R_VS;
                        break;
                    case 5:
                        this_aspect=116;
                        next_restrict=R_VS;
                        break;
                    case 6:
                        this_aspect=117;
                        next_restrict=R_VS;
                        break;
                    case 7:
                        this_aspect=118;
                        next_restrict=R_VS;
                        break;
                    case 8:
                        this_aspect=119;
                        next_restrict=R_VS;
                        break;
                    case 9:
                        this_aspect=120;
                        next_restrict=R_VS;
                        break;
                    case 10:
                        this_aspect=T_VER_CL;
                        next_restrict=9;
                        break;
                    default:;
                    }
                    break;
                default:;
                }

                //Daca e restrictie de manevra sau de chemare
                if (restriction==R_MANEVRA)
                {
                    this_aspect=S_ALB;
                    restriction=R_T20;
                }
                if (restriction==R_CHEMARE)
                {
                    this_aspect=S_ALB_CL;
                    restriction=R_T20;
                }

                LightDirection(direction);
                LightLinie(linie);

                if (this_aspect!=memo_aspect or next_restrict!=memo_restrict)
                {

                    memo_aspect=this_aspect;
                    memo_restrict=next_restrict;
                    Notify();
                    LightsOff();
                    LightThisLimit(0);
                    LightNextLimit(0);

                    // Daca este activata iesirea pe linia din stanga
                    LightStanga(ies_st);

                    if (this_aspect>=T_GALBEN and this_aspect<=T_GALBEN_100)
                        SetFXAttachment(B_GALBEN,galben);
                    if (this_aspect>=T_VER_CL and this_aspect<=T_VER_CL_100)
                        if (lights_count==2) // Daca e TMV 2
                            SetFXAttachment(B_GALBEN,galben);
                        else
                            SetFXAttachment(B_VERDE,verdeclipitor);
                    if (this_aspect>=T_VERDE and this_aspect<=T_VERDE_100)
                        if (lights_count==2) // Daca e TMV 2
                            SetFXAttachment(B_GALBEN,galben);
                        else
                            SetFXAttachment(B_VERDE,verde);

                    if (this_aspect==S_ALB)
                    {
                        SetFXAttachment(B_ALB,alb);
                    }
                    if (this_aspect==S_ALB_CL)
                    {
                        SetFXAttachment(B_CHEMARE,albclipitor);
                        SetFXAttachment(B_ROSU,rosu);
                    }
                    if (restriction!=R_TVS)
                    {
                        LightThisLimit(restriction);
                    }

                    LightNextLimit(next_restrict);
                }
            }
        }

        // BLA
        if (is_bla)
        {
            // AVARIE
            if (is_avarie and special_restrict == S_ROSU)
            {
                this_aspect = S_ROSU;
                if (this_aspect != memo_aspect)
                {
                    memo_aspect = this_aspect;
                    Notify();
                    LightsOff();
                    LightNextLimit(0);
                    SetFXAttachment(B_ROSU_AV,rosu);
                    //SetSignalState(null, RED, "Avarie la trecerea la nivel");
                }
            }
            else if (GetBLASignalState() == S_BLOC_INVERS)
            {
                this_aspect = S_BLOC_INVERS;
                if (this_aspect != memo_aspect)
                {
                    Notify();
                    memo_aspect = S_BLOC_INVERS;
                    LightsOff();
                    SetFXAttachment(B_ROSU, rosu);
                }
            }
            else if (GetBLASignalState() == RED or (next_aspect == AUTOMATIC))
            {
                this_aspect=S_ROSU;
                if (this_aspect!=memo_aspect)
                {
                    memo_aspect = this_aspect;
                    Notify();
                    LightsOff();
                    LightNextLimit(0);;
                    SetFXAttachment(B_ROSU,rosu);
                }
            }
            else
            {
                switch (next_aspect)
                {
                case S_ROSU:
                    this_aspect=T_GALBEN;
                    next_restrict=R_VS;
                    break;
                case S_GALBEN:
                    this_aspect=T_VER_CL;
                    next_restrict=R_VS;
                    break;
                case S_VERDE:
                    this_aspect=T_VERDE;
                    next_restrict=R_VS;
                    break;
                case S_GAL_CL:
                    this_aspect=T_VERDE;
                    next_restrict=R_VS;
                    break;
                case S_GAL_DCL:
                    this_aspect=T_VERDE;
                    next_restrict=R_VS;
                    break;
                case S_VER_CL:
                    this_aspect=T_VERDE;
                    next_restrict=R_VS;
                    break;
                case S_GAL_GAL:
                    this_aspect=T_VER_CL;
                    next_restrict=5;
                    break;
                case S_VER_GAL:
                    this_aspect=T_VER_CL;
                    next_restrict=5;
                    break;
                case S_GAL_GAL_60:
                    this_aspect=T_VER_CL;
                    next_restrict=6;
                    break;
                case S_VER_GAL_60:
                    this_aspect=T_VER_CL;
                    next_restrict=6;
                    break;
                case S_GAL_GAL_90:
                    this_aspect=T_VER_CL;
                    next_restrict=8;
                    break;
                case S_VER_GAL_90:
                    this_aspect=T_VER_CL;
                    next_restrict=8;
                    break;
                case S_ALB:
                    this_aspect=T_VER_CL_20;
                    next_restrict=R_T20;
                    break;
                case S_ALB_CL:
                    this_aspect=T_GALBEN_20;
                    next_restrict=R_T20;
                    break;
                case T_GALBEN:
                    this_aspect=T_VER_CL;
                    next_restrict=R_VS;
                    break;
                case T_GALBEN_20:
                    this_aspect=T_VER_CL;
                    next_restrict=R_T20;
                    break;
                case T_GALBEN_30:
                    this_aspect=T_VER_CL;
                    next_restrict=R_T30;
                    break;
                case T_GALBEN_60:
                    this_aspect=T_VER_CL;
                    next_restrict=R_T60;
                    break;
                case T_GALBEN_80:
                    this_aspect=T_VER_CL;
                    next_restrict=R_T80;
                    break;
                case T_GALBEN_90:
                    this_aspect=T_VER_CL;
                    next_restrict=R_T90;
                    break;
                case T_GALBEN_100:
                    this_aspect=T_VER_CL;
                    next_restrict=R_T100;
                    break;
                case T_VER_CL:
                    this_aspect=T_VERDE;
                    next_restrict=R_VS;
                    break;
                case T_VER_CL_20:
                    this_aspect=T_VER_CL;
                    next_restrict=4;
                    break;
                case T_VER_CL_30:
                    this_aspect=T_VER_CL;
                    next_restrict=5;
                    break;
                case T_VER_CL_60:
                    this_aspect=T_VER_CL;
                    next_restrict=6;
                    break;
                case T_VER_CL_80:
                    this_aspect=T_VER_CL;
                    next_restrict=7;
                    break;
                case T_VER_CL_90:
                    this_aspect=T_VER_CL;
                    next_restrict=8;
                    break;
                case T_VER_CL_100:
                    this_aspect=T_VER_CL;
                    next_restrict=9;
                    break;
                case T_VERDE:
                    this_aspect=T_VERDE;
                    next_restrict=R_VS;
                    break;
                case T_VERDE_20:
                    this_aspect=T_VER_CL;
                    next_restrict=4;
                    break;
                case T_VERDE_30:
                    this_aspect=T_VER_CL;
                    next_restrict=5;
                    break;
                case T_VERDE_60:
                    this_aspect=T_VER_CL;
                    next_restrict=6;
                    break;
                case T_VERDE_80:
                    this_aspect=T_VER_CL;
                    next_restrict=7;
                    break;
                case T_VERDE_90:
                    this_aspect=T_VER_CL;
                    next_restrict=8;
                    break;
                case T_VERDE_100:
                    this_aspect=T_VER_CL;
                    next_restrict=R_T100;
                    break;
                default:
                    this_aspect = T_GALBEN;
                    break;
                }

                if (this_aspect!=memo_aspect or next_restrict!=memo_restrict)
                {
                    memo_aspect=this_aspect;
                    memo_restrict=next_restrict;
                    Notify();
                    LightsOff();
                    LightNextLimit(next_restrict);

                    if (this_aspect>=T_GALBEN and this_aspect<=T_GALBEN_100)
                        SetFXAttachment(B_GALBEN,galben);
                    if (this_aspect>=T_VER_CL and this_aspect<=T_VER_CL_100)
                        SetFXAttachment(B_VERDE,verdeclipitor);
                    if (this_aspect>=T_VERDE and this_aspect<=T_VERDE_100)
                        SetFXAttachment(B_VERDE,verde);
                }
            }
        }

        // PREVESTITOR
        if (is_prevestitor)
        {
            switch (next_aspect)
            {
            case 0:
                this_aspect=T_GALBEN;
                next_restrict=R_VS;
                break;
            case 1:
                this_aspect=T_VER_CL;
                next_restrict=R_VS;
                break;
            case 2:
                this_aspect=T_VERDE;
                next_restrict=R_VS;
                break;
            case 3:
                this_aspect=T_VERDE;
                next_restrict=R_VS;
                break;
            case 4:
                this_aspect=T_VERDE;
                next_restrict=R_VS;
                break;
            case 6:
                this_aspect=T_VERDE;
                next_restrict=R_VS;
                break;
            case 7:
                this_aspect=T_VER_CL;
                next_restrict=5;
                break;
            case 8:
                this_aspect=T_VER_CL;
                next_restrict=5;
                break;
            case 13:
                this_aspect=T_VER_CL;
                next_restrict=6;
                break;
            case 14:
                this_aspect=T_VER_CL;
                next_restrict=6;
                break;
            case 19:
                this_aspect=T_VER_CL;
                next_restrict=8;
                break;
            case 20:
                this_aspect=T_VER_CL;
                next_restrict=8;
                break;
            case S_ALB:
                this_aspect=T_VER_CL_20;
                next_restrict=R_T20;
                break;
            case S_ALB_CL:
                this_aspect=T_GALBEN_20;
                next_restrict=R_T20;
                break;
            case 100:
                this_aspect=T_VER_CL;
                next_restrict=R_VS;
                break;
            case 101:
                this_aspect=T_VER_CL;
                next_restrict=4;
                break;
            case 102:
                this_aspect=T_VER_CL;
                next_restrict=5;
                break;
            case 103:
                this_aspect=T_VER_CL;
                next_restrict=6;
                break;
            case 104:
                this_aspect=T_VER_CL;
                next_restrict=7;
                break;
            case 105:
                this_aspect=T_VER_CL;
                next_restrict=8;
                break;
            case 106:
                this_aspect=T_VER_CL;
                next_restrict=9;
                break;
            case 107:
                this_aspect=T_VERDE;
                next_restrict=R_VS;
                break;
            case 108:
                this_aspect=T_VER_CL;
                next_restrict=4;
                break;
            case 109:
                this_aspect=T_VER_CL;
                next_restrict=5;
                break;
            case 110:
                this_aspect=T_VER_CL;
                next_restrict=6;
                break;
            case 111:
                this_aspect=T_VER_CL;
                next_restrict=7;
                break;
            case 112:
                this_aspect=T_VER_CL;
                next_restrict=8;
                break;
            case 113:
                this_aspect=T_VER_CL;
                next_restrict=9;
                break;
            case 114:
                this_aspect=T_VERDE;
                next_restrict=R_VS;
                break;
            case 115:
                this_aspect=T_VER_CL;
                next_restrict=4;
                break;
            case 116:
                this_aspect=T_VER_CL;
                next_restrict=5;
                break;
            case 117:
                this_aspect=T_VER_CL;
                next_restrict=6;
                break;
            case 118:
                this_aspect=T_VER_CL;
                next_restrict=7;
                break;
            case 119:
                this_aspect=T_VER_CL;
                next_restrict=8;
                break;
            case 120:
                this_aspect=T_VER_CL;
                next_restrict=9;
                break;
            default:
                this_aspect = T_GALBEN;
                break;
            }

            if (this_aspect!=memo_aspect or next_restrict!=memo_restrict)
            {
                memo_aspect=this_aspect;
                memo_restrict=next_restrict;
                Notify();
                LightsOff();
                LightNextLimit(next_restrict);

                if (this_aspect>=T_GALBEN and this_aspect<=T_GALBEN_100)
                    SetFXAttachment(B_GALBEN,galben);
                if (this_aspect>=T_VER_CL and this_aspect<=T_VER_CL_100)
                    SetFXAttachment(B_VERDE,verdeclipitor);
                if (this_aspect>=T_VERDE and this_aspect<=T_VERDE_100)
                    SetFXAttachment(B_VERDE,verde);
            }
        }

        if (is_repetitor)
        {
           UpdateRepetitor();
        }
        else if (is_manevra and !(is_intrare or is_iesire or is_triere))
        {
            UpdateManevra();
        }
        else if (is_avarie and !is_bla)
        {
            UpdateAvarie();
        }
    }

    //
    // Alege functia de actualizare a aspectelor conform tipului de semnal
    //
    thread void UpdateAspect()
    {
        // Daca semnalul este scos din uz, ignora-l
        if (xxx)
        {
            LightsOff();
            LightThisLimit(0);
            LightNextLimit(0);
            LightBar(0);
            LightDirection(0);
            LightLinie(0);
            SetFXAttachment("xxx", GetAsset().FindAsset("xxx"));
            this_aspect = next_aspect;
            Notify();
        }
        else
        {
            // if (!active_fault and !active_shunt and !active_chemare)
            // {
            //     SetSignalState(null, GREEN, "");
            //     SetSignalState(null, AUTOMATIC, "");
            //     Interface.Log("SIG-RO-CFR-DBG> " + GetLocalisedName() + " : Semnalul nu are aspect activ, se va actualiza aspectul implicit");
            // }

            SetFXAttachment("xxx", null);
            if (signal_type == "DTV")
                UpdateDTV();
            else if (signal_type == "MEC" or signal_type == "MEC_DR")
                UpdateMEC();
            else if (signal_type == "TMV")
                UpdateTMV();
            else if (signal_type == "TRIERE")
                UpdateTriere();
        }
    }

    //
    // Actualizeaza toate legaturile si aspectele
    //
    thread void UpdateAll()
    {
        // sterge toate macazurile existente si refa legaturile
        junctionIDList[0, junctionIDList.size()] = null;
        LinkSemnal(true); // leaga semnal inainte
        LinkSemnal(false); // leaga semnal inapoi
        UpdateAspect();
    }

    //
    // Message Handler for all Semnal messages
    //
    void MessageHandler(Message msg)
    {
        if (!msg) {
            Interface.Log("SIG-RO-CFR-ERR> MessageHandler: msg is null!");
            return;
        }

        if (msg.major == "Semnal")
        {
            string[] tok = Str.Tokens(msg.minor, "/");

            if (DEBUG) {
                if (cast<Signal>msg.src) {
                    Interface.Log("SIG-RO-CFR-DBG> " + GetLocalisedName() + " : Primit mesaj Semnal " + msg.minor + " de la " + (cast<Signal>msg.src).GetLocalisedName());
                }
                else
                {
                    Interface.Log("SIG-RO-CFR-DBG> " + GetLocalisedName() + " : Primit mesaj Semnal " + msg.minor + " de la " + (cast<GameObject>msg.src).GetDebugName());
                }
            }

            if (tok[0] == "stare")
            {
                // nu face update-uri aiurea, doar daca e necesar
                if (linkSignal[LINK_NEXT] and linkSignal[LINK_NEXT].GetGameObjectID().DoesMatch((cast<Semnal>msg.src).GetGameObjectID()))
                {
                    next_aspect = Str.ToInt(tok[1]);
                    UpdateAspect();
                }
            }
            else if (tok[0] == "aspect")
            {
                // if (Str.ToInt(tok[1]) == AUTOMATIC)
                // {
                //     //Interface.Log("SIG-RO-CFR-DBG> Setat pe AUTOMAT");
                //     //SetSignalState(null, AUTOMATIC, "");
                //     //Sleep(1.0);
                //     //active_shunt = false;
                //     //active_fault = false;
                //     //active_chemare = false;
                //     special_restrict = false;
                // }
                // // else if (Str.ToInt(tok[1]) == S_ALB)
                // //     active_shunt = true;
                // // else if (Str.ToInt(tok[1]) == S_ALB_CL)
                // //     active_chemare = true;
                // // else if (Str.ToInt(tok[1]) == S_ROSU_AV)
                // //     active_fault = true;
                // else
                // {
                //     special_restrict = true;
                // }

                special_restrict = Str.ToInt(tok[1]);

                UpdateAspect();
            }
            else if (tok[0] == "directie")
            {
                if (has_direction)
                    LightDirection(Str.ToInt(tok[1]));
            }

        }
        else if (msg.major == "Signal")
        {
            if (msg.minor == "State Changed")
            {
                if (DEBUG) Interface.Log("SIG-RO-CFR-DBG> " + GetLocalisedName() + " : Primit mesaj Signal "  + msg.minor + " de la " + (cast<Signal>msg.src).GetLocalisedName());
                if (msg.src == me)
                { // my aspect has changed
                    UpdateAll();
                }
            }
            // Change BLA LEFT state
            if (msg.dst != me)
                return;

            if (bla_left and (is_bla or is_bla4i))
            {
                if (msg.minor == "Train Approaching")
                {
                    orientare_bla = true; // schimbă orientarea de bloc dacă se apropie un tren
                    UpdateAspect();
                }
                else if (msg.minor == "Train Leaving")
                {
                    orientare_bla = false; // reaplică orientarea de bloc dacă trenul se îndepărtează
                    UpdateAspect();
                }
            }
        }
        else if (msg.major == "Junction")
        {
            if (msg.minor == "Toggled")
            {
                int i;
                if (DEBUG)
                    Interface.Log("SIG-RO-CFR-DBG> " + GetLocalisedName() + " : Primit mesaj Junction Toggled de la " + (cast<Junction>msg.src).GetLocalisedName());
                for (i = 0; i < junctionIDList.size(); ++i)
                    if (junctionIDList[i] and junctionIDList[i].DoesMatch((cast<Junction>msg.src).GetGameObjectID()))
                    {
                        // nu face update-uri aiurea, doar daca e necesar
                        if (DEBUG)
                            Interface.Log("SIG-RO-CFR-DBG> " + GetLocalisedName() + " : Macazul " + (cast<Junction>msg.src).GetLocalisedName() + " e pe lista mea");
                        UpdateAll();
                        break;
                    }
            }
        }
    }

    void SetSignalName(string nume)
    {
        SetFXNameText("name0", " ");
        SetFXNameText("name1", " ");
        if (nume != "")
        {
            if (is_pitic) // daca e pitic, nu imparti textul in doua
                SetFXNameText("name0", nume);
            else // daca nu e pitic, imparte textul pe doua randuri
            {
                string[] tok=Str.Tokens(nume, " ");
                    SetFXNameText("name0",tok[0]);
                if (tok.size()>=2) // daca exista doua cuvinte
                    SetFXNameText("name1",tok[1]);
            }
        }
    }



    public void SetProperties(Soup soup)
    {
        inherited(soup);
        numeAfisat = soup.GetNamedTag("numeAfisat");
        xxx = soup.GetNamedTagAsBool("xxx", false);
        bla_left = soup.GetNamedTagAsBool("bla_left", false);

        if (bla_left == true)
            orientare_bla = false; // initial daca avem activat bla_left trebuie sa punem semnalele pe rosu
        UpdateAspect();
        SetSignalName(numeAfisat);
    }

    public Soup GetProperties(void)
    {
        Soup soup = inherited();
        soup.SetNamedTag("numeAfisat", numeAfisat);
        soup.SetNamedTag("xxx", xxx);
        soup.SetNamedTag("bla_left", bla_left);
        return soup;
    }


    public void SetPropertyValue(string propertyID, string value)
    {
        if (propertyID == "name")
        {
            numeAfisat = value;
            SetSignalName(numeAfisat);
        }
    }

    public void LinkPropertyValue(string propertyID)
    {
        if (propertyID == "disabled")
        {
            xxx = !xxx;
            memo_aspect = AUTOMATIC;
            UpdateAspect();
        }
        else if (propertyID == "bla_left")
        {
            bla_left = !bla_left;
            memo_aspect = AUTOMATIC;
            UpdateAspect();
        }
    }

    string GetPropertyType(string propertyID)
    {
        string ret;

        if (propertyID == "name")
            return "string,0,8";
        else if (propertyID == "disabled")
            return "link";
        else if (propertyID == "bla_left")
            return "link";

        return "link";
    }

    public string GetPropertyName(string propertyID)
    {
        if (propertyID == "name")
            return "Choose a display name";

        return "null";
    }

    public string GetPropertyValue(string propertyID)
    {
        if (propertyID == "name")
            return numeAfisat;

        return "null";
    }

    public string GetDescriptionHTML(void)
    {
        HTMLBuffer output = HTMLBufferStatic.Construct();
        string nume;
        string nextSignalName = "no signal";

        if (numeAfisat == "")
            nume = "(no name)";
        else
            nume = numeAfisat;

        output.Print("<p><font size=15>" + html_title + " signal </font><font size=5>" + BUILD + "</font></p><br>");
        output.Print("<p>To configure the signal aspects you must place line markers after the signal (RO_mrk_...).</p><br>");

        output.Print("<p>Signal type: " + signal_type + "</p><br>");

        output.Print("<p>Name displayed on the signal: <font color=#ffff00><a href=live://property/name>" + nume + "</a></font></p><br>");

        if (is_bla or is_bla4i)
            output.Print("<p>" + HTMLWindow.CheckBox("live://property/bla_left", bla_left) + " Line block orientation for left-side double track</p><br>");

        output.Print("<p>" + HTMLWindow.CheckBox("live://property/disabled", xxx) + " Signal is out of order</p><br>");

        if (linkSignal[LINK_NEXT])
            nextSignalName = linkSignal[LINK_NEXT].GetLocalisedName();
        output.Print("<p>Next direct signal: <font color=#ffff00><b>" + nextSignalName + "</b></font></p><br>");

        if (is_intrare or is_iesire or is_manevra)
            output.Print("<p>Next junction is at <font color=#ffff00><b>" + DistantaMacaz() + "</b></font></p><br>");
        else
            output.Print("<p>Next signal is at <font color=#ffff00><b>" + DistantaSemnal() + "</b></font></p><br>");

        output.Print("<p>For detailed configuration tutorial, support and updates visit https://www.tapatalk.com/groups/vvmm/</p>");

        return output.AsString();
    }

    //
    // Wait for IDs to be assigned by Trainz
    //
    thread void InitialUpdate()
    {
        if (DEBUG) Interface.Log("SIG-RO-CFR-DBG> " + GetLocalisedName() + " : InitialUpdate pentru " + GetDebugName());
        while (GetGameObjectID() == null)
            Sleep(1.0);
        UpdateAll();
    }

    //
    // Initialize the signal
    //
    public void Init(Asset asset)
    {
        inherited(asset);
        Asset self = GetAsset();
        config = self.GetConfigSoup();

        Soup extensions = config.GetNamedSoup("extensions");

        signal_type = extensions.GetNamedTag("signal_type-474195");
        is_iesire = extensions.GetNamedTagAsBool("is_iesire-474195", false);
        is_intrare = extensions.GetNamedTagAsBool("is_intrare-474195", false);
        is_bla = extensions.GetNamedTagAsBool("is_bla-474195", false);
        is_bla4i = extensions.GetNamedTagAsBool("is_bla4i-474195", false);
        is_prevestitor = extensions.GetNamedTagAsBool("is_prevestitor-474195", false);
        is_repetitor = extensions.GetNamedTagAsBool("is_repetitor-474195", false);
        is_manevra = extensions.GetNamedTagAsBool("is_manevra-474195", false);
        is_avarie = extensions.GetNamedTagAsBool("is_avarie-474195", false);
        is_triere = extensions.GetNamedTagAsBool("is_triere-474195", false);
        is_chemare = extensions.GetNamedTagAsBool("is_chemare-474195", false);
        is_pitic = extensions.GetNamedTagAsBool("is_pitic-474195", false);
        is_grup = extensions.GetNamedTagAsBool("is_grup-474195", false);
        has_bar = extensions.GetNamedTagAsInt("has_bar-474195", 0);
        has_direction = extensions.GetNamedTagAsInt("has_direction-474195", 0);
        lights_count = extensions.GetNamedTagAsInt("lights_count-474195", 0);


        // Incarca becurile din kuid-table
        rosu = self.FindAsset("red");
        galben = self.FindAsset("yellow");
        verde = self.FindAsset("green");
        alb = self.FindAsset("white");
        albastru = self.FindAsset("blue");
        albmic = self.FindAsset("whitesmall");
        galbenmic = self.FindAsset("yellowsmall");
        verdemic = self.FindAsset("greensmall");
        verdeclipitor = self.FindAsset("greenblink");
        galbenclipitor = self.FindAsset("yellowblink");
        rosuclipitor = self.FindAsset("redblink");
        albclipitor = self.FindAsset("whiteblink");
        alblinie = self.FindAsset("whiteline");
        galbenclipitor2 = self.FindAsset("yellowblink2");

        if (signal_type == "TMV" and (has_bar or has_direction))
            Letters = GetAsset().FindAsset("texture-lib");

        if (signal_type == "MEC_DR")
            html_title = "DR";
        else
            html_title = "RO CFR";

        LightsOff();
        LightThisLimit(0);
        LightNextLimit(0);
        LightBar(0);
        LightDirection(0);
        LightLinie(0);

        InitialUpdate();

        // handler pentru mesaje
        AddHandler(me, "Semnal", "", "MessageHandler");
        AddHandler(me, "Junction", "Toggled", "MessageHandler");
        AddHandler(me, "Signal", "", "MessageHandler");
    }

};