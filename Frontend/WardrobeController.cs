using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;


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
                           item is Bottom ? "Bottom" :
                           item is Dress ? "Dress" : "Footwear",
                    Extra = item is Top t ? t.SleeveType :
                            item is Bottom b ? b.FitType :
                            item is Dress d ? d.DressLength :
                            item is Footwear f ? f.StyleCategory : ""
                });
            }
            return Ok(items);
        }

        // POST /api/wardrobe/add
        [HttpPost("add")]
        public IActionResult AddClothing([FromBody] AddClothingRequest request)
        {
            if (request.Type == null || request.ItemID == null || request.Name == null || request.PrimaryColor == null)
                return BadRequest(new { message = "Invalid request. Required fields are missing." });

            ClothingItem? newItem = request.Type switch
            {
                "Top" => new Top(request.ItemID, request.Name, request.PrimaryColor,
                                 request.Tags ?? new List<string>(), request.Extra ?? "", request.ImageFilePath ?? ""),
                "Bottom" => new Bottom(request.ItemID, request.Name, request.PrimaryColor,
                                       request.Tags ?? new List<string>(), request.Extra ?? "", request.ImageFilePath ?? ""),
                "Dress" => new Dress(request.ItemID, request.Name, request.PrimaryColor,
                                      request.Tags ?? new List<string>(), request.Extra ?? "", request.ImageFilePath ?? ""),
                "Footwear" => new Footwear(request.ItemID, request.Name, request.PrimaryColor,
                                           request.Tags ?? new List<string>(), request.Extra ?? "", request.ImageFilePath ?? ""),

                _ => (ClothingItem?)null
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
                IsDressOutfit = outfit.IsDressOutfit,
                Top = outfit.SelectedTop != null ? new
                {
                    outfit.SelectedTop.ItemID,
                    outfit.SelectedTop.Name,
                    outfit.SelectedTop.ImageFilePath,
                    outfit.SelectedTop.PrimaryColor,
                    outfit.SelectedTop.IsClean
                } : null,
                Bottom = outfit.SelectedBottom != null ? new
                {
                    outfit.SelectedBottom.ItemID,
                    outfit.SelectedBottom.Name,
                    outfit.SelectedBottom.ImageFilePath,
                    outfit.SelectedBottom.PrimaryColor,
                    outfit.SelectedBottom.IsClean
                } : null,
                Dress = outfit.SelectedDress != null ? new
                {
                    outfit.SelectedDress.ItemID,
                    outfit.SelectedDress.Name,
                    outfit.SelectedDress.ImageFilePath,
                    outfit.SelectedDress.PrimaryColor,
                    outfit.SelectedDress.IsClean
                } : null,
                Shoes = new
                {
                    outfit.SelectedShoes.ItemID,
                    outfit.SelectedShoes.Name,
                    outfit.SelectedShoes.ImageFilePath,
                    outfit.SelectedShoes.PrimaryColor,
                    outfit.SelectedShoes.IsClean
                },
                IsReady = outfit.VerifyAvailability()
            });
        }


        // POST /api/wardrobe/toggle/{itemId}
        [HttpPost("toggle/{itemId}")]
        public IActionResult ToggleLaundryStatus(string itemId)
        {
            var item = _manager.Inventory.Find(i => i.ItemID == itemId);
            if (item == null)
                return NotFound(new { message = "Item not found." });

            item.ToggleLaundryStatus();
            return Ok(new
            {
                message = $"{item.Name} is now {(item.IsClean ? "Clean" : "In the Laundry Basket")}.",
                itemId = item.ItemID,
                isClean = item.IsClean
            });
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
                    IsDressOutfit = outfit.IsDressOutfit,
                    Top = outfit.SelectedTop != null ? new
                    {
                        outfit.SelectedTop.ItemID,
                        outfit.SelectedTop.Name,
                        outfit.SelectedTop.ImageFilePath,
                        outfit.SelectedTop.PrimaryColor,
                        outfit.SelectedTop.IsClean
                    } : null,
                    Bottom = outfit.SelectedBottom != null ? new
                    {
                        outfit.SelectedBottom.ItemID,
                        outfit.SelectedBottom.Name,
                        outfit.SelectedBottom.ImageFilePath,
                        outfit.SelectedBottom.PrimaryColor,
                        outfit.SelectedBottom.IsClean
                    } : null,
                    Dress = outfit.SelectedDress != null ? new
                    {
                        outfit.SelectedDress.ItemID,
                        outfit.SelectedDress.Name,
                        outfit.SelectedDress.ImageFilePath,
                        outfit.SelectedDress.PrimaryColor,
                        outfit.SelectedDress.IsClean
                    } : null,
                    Shoes = new
                    {
                        outfit.SelectedShoes.ItemID,
                        outfit.SelectedShoes.Name,
                        outfit.SelectedShoes.ImageFilePath,
                        outfit.SelectedShoes.PrimaryColor,
                        outfit.SelectedShoes.IsClean
                    },
                    ScheduledDate = outfit.ScheduledDate?.ToString("yyyy-MM-dd"),
                    IsReady = outfit.VerifyAvailability()
                });
            }
            return Ok(outfits);
        }


        // POST /api/wardrobe/lookbook/save
        [HttpPost("lookbook/save")]
        public IActionResult SaveToLookbook([FromBody] SaveOutfitRequest request)
        {
            if (string.IsNullOrEmpty(request.OutfitID) || string.IsNullOrEmpty(request.OutfitName))
                return BadRequest(new { message = "OutfitID and OutfitName are required." });

            // Check if this is a dress outfit or standard outfit
            if (!string.IsNullOrEmpty(request.DressID))
            {
                // Dress outfit
                var dress = _manager.Inventory.Find(i => i.ItemID == request.DressID) as Dress;
                var shoes = _manager.Inventory.Find(i => i.ItemID == request.ShoesID) as Footwear;

                if (dress == null || shoes == null)
                    return BadRequest(new { message = "Dress or shoes not found." });

                var outfit = new Outfit(request.OutfitID, request.OutfitName, dress, shoes);
                _manager.Lookbook.Add(outfit);

                return Ok(new { message = $"{outfit.OutfitName} saved to lookbook." });
            }
            else
            {
                // Standard outfit (Top + Bottom + Footwear)
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

        // GET /api/wardrobe/stats
        [HttpGet("stats")]
        public IActionResult GetStats()
        {
            int totalItems = _manager.Inventory.Count;
            int cleanItems = _manager.Inventory.Count(i => i.IsClean);
            int inLaundry = _manager.Inventory.Count(i => !i.IsClean);
            int savedOutfits = _manager.Lookbook.Count;
            int scheduled = _manager.Schedules.Count;

            return Ok(new
            {
                totalItems,
                cleanItems,
                inLaundry,
                savedOutfits,
                scheduled
            });
        }

        // POST /api/wardrobe/upload
        [HttpPost("upload")]
        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "No file uploaded." });

            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(extension))
                return BadRequest(new { message = "Invalid file type. Only JPG, PNG, and WEBP are allowed." });

            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            var fileName = $"{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var relativePath = $"/uploads/{fileName}";
            return Ok(new { filePath = relativePath });
        }

        // DELETE /api/wardrobe/inventory/{itemId}
        [HttpDelete("inventory/{itemId}")]
        public IActionResult DeleteClothingItem(string itemId)
        {
            bool removed = _manager.RemoveClothing(itemId);
            if (!removed)
                return NotFound(new { message = "Item not found." });

            return Ok(new { message = "Item deleted successfully." });
        }

        // DELETE /api/wardrobe/lookbook/{outfitId}
        [HttpDelete("lookbook/{outfitId}")]
        public IActionResult DeleteOutfit(string outfitId)
        {
            bool removed = _manager.RemoveOutfit(outfitId);
            if (!removed)
                return NotFound(new { message = "Outfit not found." });

            return Ok(new { message = "Outfit deleted successfully." });
        }

        // GET /api/wardrobe/calendar
        [HttpGet("calendar")]
        public IActionResult GetCalendar()
        {
            var scheduled = new List<object>();
            foreach (var entry in _manager.Schedules)
            {
                var outfit = _manager.Lookbook.Find(o => o.OutfitID == entry.Value);
                if (outfit != null)
                {
                    scheduled.Add(new
                    {
                        Date = entry.Key,
                        outfit.OutfitID,
                        outfit.OutfitName,
                        IsDressOutfit = outfit.IsDressOutfit,
                        Top = outfit.SelectedTop != null ? new
                        {
                            outfit.SelectedTop.ItemID,
                            outfit.SelectedTop.Name,
                            outfit.SelectedTop.ImageFilePath
                        } : null,
                        Bottom = outfit.SelectedBottom != null ? new
                        {
                            outfit.SelectedBottom.ItemID,
                            outfit.SelectedBottom.Name,
                            outfit.SelectedBottom.ImageFilePath
                        } : null,
                        Dress = outfit.SelectedDress != null ? new
                        {
                            outfit.SelectedDress.ItemID,
                            outfit.SelectedDress.Name,
                            outfit.SelectedDress.ImageFilePath
                        } : null,
                        Shoes = new
                        {
                            outfit.SelectedShoes.ItemID,
                            outfit.SelectedShoes.Name,
                            outfit.SelectedShoes.ImageFilePath
                        }
                    });
                }
            }
            return Ok(scheduled);
        }

        // POST /api/wardrobe/calendar
        [HttpPost("calendar")]
        public IActionResult ScheduleOutfit([FromBody] ScheduleRequest request)
        {
            if (string.IsNullOrEmpty(request.Date) || string.IsNullOrEmpty(request.OutfitID))
                return BadRequest(new { message = "Date and OutfitID are required." });

            var outfit = _manager.Lookbook.Find(o => o.OutfitID == request.OutfitID);
            if (outfit == null)
                return NotFound(new { message = "Outfit not found." });

            _manager.Schedules[request.Date] = request.OutfitID;
            outfit.ScheduledDate = DateTime.Parse(request.Date);

            return Ok(new { message = "Outfit scheduled successfully." });
        }

        // DELETE /api/wardrobe/calendar/{date}
        [HttpDelete("calendar/{date}")]
        public IActionResult RemoveSchedule(string date)
        {
            if (_manager.Schedules.ContainsKey(date))
            {
                var outfitId = _manager.Schedules[date];
                _manager.Schedules.Remove(date);

                var outfit = _manager.Lookbook.Find(o => o.OutfitID == outfitId);
                if (outfit != null && outfit.ScheduledDate.HasValue && outfit.ScheduledDate.Value.ToString("yyyy-MM-dd") == date)
                {
                    outfit.ScheduledDate = null;
                }

                return Ok(new { message = "Schedule removed successfully." });
            }
            return NotFound(new { message = "No schedule found for this date." });
        }
    }


    // Request models
    public class AddClothingRequest
    {
        public string? ItemID { get; set; }
        public string? Name { get; set; }
        public string? PrimaryColor { get; set; }
        public List<string>? Tags { get; set; }
        public string? Type { get; set; }
        public string? Extra { get; set; }
        public string? ImageFilePath { get; set; }
    }


    public class SaveOutfitRequest
    {
        public string? OutfitID { get; set; }
        public string? OutfitName { get; set; }
        public string? TopID { get; set; }
        public string? BottomID { get; set; }
        public string? DressID { get; set; }
        public string? ShoesID { get; set; }
    }

    public class ScheduleRequest
    {
        public string? Date { get; set; }
        public string? OutfitID { get; set; }
    }

}
