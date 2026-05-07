using System;

namespace WardrobeMaker
{
    public class Outfit
    {
        public string OutfitID { get; set; }
        public string OutfitName { get; set; }
        public Top? SelectedTop { get; set; }
        public Bottom? SelectedBottom { get; set; }
        public Dress? SelectedDress { get; set; }
        public Footwear SelectedShoes { get; set; }
        public DateTime? ScheduledDate { get; set; }

        //Constructor for Standard outfit (Top + Bottom + Footwear)
        public Outfit(string outfitID, string outfitName, Top top, Bottom bottom, Footwear shoes)
        {
            OutfitID = outfitID;
            OutfitName = outfitName;
            SelectedTop = top;
            SelectedBottom = bottom;
            SelectedDress = null;
            SelectedShoes = shoes;
            ScheduledDate = null;
        }

        //Constructor for Dress outfit (Dress + Footwear)
        public Outfit(string outfitID, string outfitName, Dress dress, Footwear shoes)
        {
            OutfitID = outfitID;
            OutfitName = outfitName;
            SelectedTop = null;
            SelectedBottom = null;
            SelectedDress = dress;
            SelectedShoes = shoes;
            ScheduledDate = null;
        }

        public bool VerifyAvailability()
        {
            //Standard outfit: Top + Bottom + Shoes
            if (SelectedDress == null)
            {
                return SelectedTop.IsClean && SelectedBottom.IsClean && SelectedShoes.IsClean;
            }
            //Dress outfit: Dress + Shoes
            return SelectedDress.IsClean && SelectedShoes.IsClean;
        }

        public bool IsDressOutfit => SelectedDress != null;
    }
}