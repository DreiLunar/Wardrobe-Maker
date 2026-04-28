using WardrobeMaker;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddSingleton<WardrobeManager>();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
    });
});

var app = builder.Build();

// Ensure uploads directory exists for user photo uploads
var webRootPath = builder.Environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
var uploadsPath = Path.Combine(webRootPath, "uploads");
if (!Directory.Exists(uploadsPath))
{
    Directory.CreateDirectory(uploadsPath);
}

app.UseCors();
app.UseStaticFiles();

// Redirect root to index.html so all relative links work correctly
app.MapGet("/", () => Results.Redirect("/index.html"));

app.MapControllers();

app.Run();
