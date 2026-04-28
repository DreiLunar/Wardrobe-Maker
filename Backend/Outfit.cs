using System;

namespace WardrobeMaker
{
    public class Outfit
    {
        public string OutfitID { get; set; }
        public string OutfitName { get; set; }
        public Top SelectedTop { get; set; }
        public Bottom SelectedBottom { get; set; }
        public Footwear SelectedShoes { get; set; }
        public DateTime? ScheduledDate { get; set; }

        public Outfit(string outfitID, string outfitName, Top top, Bottom bottom, Footwear shoes)
        {
            OutfitID = outfitID;
            OutfitName = outfitName;
            SelectedTop = top;
            SelectedBottom = bottom;
            SelectedShoes = shoes;
            ScheduledDate = null;
        }

        public bool VerifyAvailability()
        {
            return SelectedTop.IsClean && SelectedBottom.IsClean && SelectedShoes.IsClean;
        }
    }
}