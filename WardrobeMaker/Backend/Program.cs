using System.IO;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Hosting;
using WardrobeMaker;

var builder = WebApplication.CreateBuilder(args);
var frontendRoot = Path.GetFullPath(Path.Combine(builder.Environment.ContentRootPath, "..", "Frontend"));

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

var uploadsFolder = Path.Combine(frontendRoot, "uploads");
Directory.CreateDirectory(uploadsFolder);

var staticFiles = new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(frontendRoot)
};

app.UseDefaultFiles(new DefaultFilesOptions
{
    FileProvider = staticFiles.FileProvider,
    DefaultFileNames = { "html/index.html" }
});
app.UseStaticFiles(staticFiles);
app.UseRouting();
app.UseCors();
app.UseAuthorization();
app.MapControllers();

//Add route mapping for HTML files in the html subdirectory
app.MapGet("/{filename}", (HttpContext context, string filename) =>
{
    if (filename.EndsWith(".html") && !filename.StartsWith("html/"))
    {
        context.Response.Redirect($"/html/{filename}", permanent: false);
    }
});

app.MapFallbackToFile("html/index.html", staticFiles);

app.Logger.LogInformation("Wardrobe Maker web app starting.");

app.Run();
