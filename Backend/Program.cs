using System;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http; 
using Microsoft.Extensions.DependencyInjection;
using System.Linq;

namespace WardrobeMaker
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("=== Wardrobe Maker Server: ONLINE ===\n");

            var builder = WebApplication.CreateBuilder(args);

            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowAll", policy => 
                    policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
            });

            builder.Services.AddSingleton<WardrobeManager>();

            var app = builder.Build();
            app.UseCors("AllowAll");
            
            app.MapGet("/", () => "The Wardrobe Maker Brain is running!");

            app.MapGet("/api/inventory", (WardrobeManager manager) => 
            {
                return Results.Ok(manager.Inventory);
            });

            app.MapGet("/api/outfits", (WardrobeManager manager) => 
            {
                Console.WriteLine("[API] Sending Saved Outfits to Lookbook...");
                return Results.Ok(manager.SavedOutfits);
            });

            app.MapPost("/api/outfits", (WardrobeManager manager, OutfitRequest req) => 
            {
                var top = manager.Inventory.OfType<Top>().FirstOrDefault(i => i.ItemID == req.topId);
                var bottom = manager.Inventory.OfType<Bottom>().FirstOrDefault(i => i.ItemID == req.bottomId);
                var shoes = manager.Inventory.OfType<Footwear>().FirstOrDefault(i => i.ItemID == req.shoesId);

                if (top == null || bottom == null || shoes == null) {
                    return Results.BadRequest("Could not find selected items in inventory.");
                }

                string newId = "OFT-" + Guid.NewGuid().ToString().Substring(0, 4).ToUpper();
                var newOutfit = new Outfit(newId, req.outfitName, top, bottom, shoes);

                manager.AddOutfit(newOutfit);
    
                Console.WriteLine($"[API] Outfit '{newOutfit.OutfitName}' saved to JSON.");
                return Results.Ok(new { message = "Success" });
            });
          
            app.MapDelete("/api/outfits/{id}", (WardrobeManager manager, string id) => 
            {
                bool isDeleted = manager.DeleteOutfit(id);
                
                if (isDeleted) {
                    Console.WriteLine($"[API] Successfully deleted outfit: {id}");
                    return Results.Ok(new { message = "Outfit deleted!" });
                }
                
                return Results.NotFound(new { message = "Outfit not found." });
            });

			app.MapDelete("/api/outfits", (WardrobeManager manager) => 
            {
                manager.ClearAllOutfits();
                Console.WriteLine("[API] Successfully cleared all saved outfits!");
                return Results.Ok(new { message = "All outfits cleared!" });
            });

            app.Run();
        }
    }

    public record OutfitRequest(string outfitName, string topId, string bottomId, string shoesId);
}