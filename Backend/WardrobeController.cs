using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;

namespace WardrobeMaker
{
    [ApiController]
    [Route("api/wardrobe")]
    public class WardrobeController : ControllerBase
    {
        private readonly WardrobeManager _manager;

        public WardrobeController(WardrobeManager manager)
        {
            _manager = manager;
        }

        // GET /api/wardrobe/inventory
        [HttpGet("inventory")]
        public IActionResult GetInventory()
        {
            var items = new List<object>();
            foreach (var item in _manager.Inventory)
            {
                items.Add(new
                {
                    item.ItemID,
                    item.Name,
                    item.PrimaryColor,
                    item.Tags,
                    item.IsClean,
                    item.ImageFilePath,
                    Type = item is Top ? "Top" :
                           item is Bottom ? "Bottom" : "Footwear",
                    Extra = item is Top t ? t.SleeveType :
                            item is Bottom b ? b.FitType :
                            item is Footwear f ? f.StyleCategory : ""
                });
            }
            return Ok(items);
        }

        // POST /api/wardrobe/add
        [HttpPost("add")]
        public IActionResult AddClothing([FromBody] AddClothingRequest request)
        {
            ClothingItem newItem = request.Type switch
            {
                "Top" => new Top(request.ItemID, request.Name, request.PrimaryColor,
                                 request.Tags, request.Extra),
                "Bottom" => new Bottom(request.ItemID, request.Name, request.PrimaryColor,
                                       request.Tags, request.Extra),
                "Footwear" => new Footwear(request.ItemID, request.Name, request.PrimaryColor,
                                           request.Tags, request.Extra),
                _ => null
            };

            if (newItem == null)
                return BadRequest(new { message = "Invalid clothing type." });

            _manager.AddClothing(newItem);
            return Ok(new { message = $"{newItem.Name} added successfully." });
        }

        // GET /api/wardrobe/generate?tag=casual
        [HttpGet("generate")]
        public IActionResult GenerateOutfit([FromQuery] string tag = "")
        {
            Outfit outfit = _manager.GenerateOutfit(tag);

            if (outfit == null)
                return BadRequest(new { message = "Not enough clean items to build an outfit." });

            return Ok(new
            {
                outfit.OutfitID,
                outfit.OutfitName,
                Top = outfit.SelectedTop.Name,
                Bottom = outfit.SelectedBottom.Name,
                Shoes = outfit.SelectedShoes.Name,
                IsReady = outfit.VerifyAvailability()
            });
        }

        // POST /api/wardrobe/toggle/{itemId}
        [HttpPost("toggle/{itemId}")]
        public IActionResult ToggleLaundry(string itemId)
        {
            var item = _manager.Inventory.Find(i => i.ItemID == itemId);
            if (item == null)
                return NotFound(new { message = "Item not found." });

            item.ToggleLaundryStatus();
            return Ok(new { message = $"{item.Name} is now {(item.IsClean ? "Clean" : "In the Laundry Basket")}." });
        }

        // GET /api/wardrobe/lookbook
        [HttpGet("lookbook")]
        public IActionResult GetLookbook()
        {
            var outfits = new List<object>();
            foreach (var outfit in _manager.Lookbook)
            {
                outfits.Add(new
                {
                    outfit.OutfitID,
                    outfit.OutfitName,
                    Top = outfit.SelectedTop.Name,
                    Bottom = outfit.SelectedBottom.Name,
                    Shoes = outfit.SelectedShoes.Name,
                    ScheduledDate = outfit.ScheduledDate?.ToShortDateString(),
                    IsReady = outfit.VerifyAvailability()
                });
            }
            return Ok(outfits);
        }

        // POST /api/wardrobe/lookbook/save
        [HttpPost("lookbook/save")]
        public IActionResult SaveToLookbook([FromBody] SaveOutfitRequest request)
        {
            var top = _manager.Inventory.Find(i => i.ItemID == request.TopID) as Top;
            var bottom = _manager.Inventory.Find(i => i.ItemID == request.BottomID) as Bottom;
            var shoes = _manager.Inventory.Find(i => i.ItemID == request.ShoesID) as Footwear;

            if (top == null || bottom == null || shoes == null)
                return BadRequest(new { message = "One or more items not found." });

            var outfit = new Outfit(request.OutfitID, request.OutfitName, top, bottom, shoes);
            _manager.Lookbook.Add(outfit);

            return Ok(new { message = $"{outfit.OutfitName} saved to lookbook." });
        }
    }

    // Request models
    public class AddClothingRequest
    {
        public string ItemID { get; set; }
        public string Name { get; set; }
        public string PrimaryColor { get; set; }
        public List<string> Tags { get; set; }
        public string Type { get; set; }
        public string Extra { get; set; }
    }

    public class SaveOutfitRequest
    {
        public string OutfitID { get; set; }
        public string OutfitName { get; set; }
        public string TopID { get; set; }
        public string BottomID { get; set; }
        public string ShoesID { get; set; }
    }
}