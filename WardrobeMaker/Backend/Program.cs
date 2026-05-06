using System.IO;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using WardrobeMaker;

var options = new WebApplicationOptions
{
    ContentRootPath = Directory.GetCurrentDirectory(),
    WebRootPath = Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), "..", "Frontend"))
};

var builder = WebApplication.CreateBuilder(options);

builder.Services.AddSingleton<WardrobeManager>();
builder.Services.AddControllers();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

var uploadsFolder = Path.Combine(app.Environment.WebRootPath, "uploads");
if (!Directory.Exists(uploadsFolder))
{
    Directory.CreateDirectory(uploadsFolder);
}

app.UseDefaultFiles(new DefaultFilesOptions
{
    DefaultFileNames = { "html/index.html" }
});
app.UseStaticFiles();
app.UseRouting();
app.UseCors();
app.UseAuthorization();
app.MapControllers();

// Add route mapping for HTML files in the html subdirectory
app.MapGet("/{filename}", async (HttpContext context, string filename) =>
{
    if (filename.EndsWith(".html") && !filename.StartsWith("html/"))
    {
        context.Response.Redirect($"/html/{filename}", permanent: false);
    }
});

app.MapFallbackToFile("html/index.html");

app.Logger.LogInformation("Wardrobe Maker web app starting.");

app.Run();
