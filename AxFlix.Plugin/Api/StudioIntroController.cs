using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Mime;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace AxFlix.Plugin.Api;

/// <summary>
/// API controller for studio intro videos.
/// </summary>
[ApiController]
[Route("axflix")]
public class StudioIntroController : ControllerBase
{
    /// <summary>
    /// Gets the list of available studio intro videos.
    /// </summary>
    [HttpGet("intros")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public ActionResult<IEnumerable<StudioIntroInfo>> GetAvailableIntros()
    {
        var config = Plugin.Instance?.Configuration;
        if (config == null)
        {
            return Ok(Array.Empty<StudioIntroInfo>());
        }

        var path = config.IntroVideosPath;
        if (string.IsNullOrEmpty(path) || !Directory.Exists(path))
        {
            return Ok(Array.Empty<StudioIntroInfo>());
        }

        var videoExtensions = new[] { ".mp4", ".webm", ".mkv", ".mov", ".png", ".jpg", ".jpeg", ".svg", ".webp" };
        var intros = Directory.GetFiles(path)
            .Where(f => videoExtensions.Contains(Path.GetExtension(f).ToLowerInvariant()))
            .Select(f => new StudioIntroInfo
            {
                StudioName = Path.GetFileNameWithoutExtension(f),
                FileName = Path.GetFileName(f),
                Url = $"/axflix/intro/{Uri.EscapeDataString(Path.GetFileName(f))}"
            })
            .ToList();

        return Ok(intros);
    }

    /// <summary>
    /// Serves a studio intro video file.
    /// </summary>
    [HttpGet("intro/{fileName}")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult GetIntroVideo([FromRoute] string fileName)
    {
        var config = Plugin.Instance?.Configuration;
        if (config == null)
        {
            return NotFound();
        }

        var decodedFileName = Uri.UnescapeDataString(fileName);
        var filePath = Path.Combine(config.IntroVideosPath, decodedFileName);

        var fullPath = Path.GetFullPath(filePath);
        var basePath = Path.GetFullPath(config.IntroVideosPath);
        if (!fullPath.StartsWith(basePath, StringComparison.OrdinalIgnoreCase))
        {
            return NotFound();
        }

        if (!System.IO.File.Exists(fullPath))
        {
            return NotFound();
        }

        var ext = Path.GetExtension(fullPath).ToLowerInvariant();
        var contentType = ext switch
        {
            ".mp4" => "video/mp4",
            ".webm" => "video/webm",
            ".mkv" => "video/x-matroska",
            ".mov" => "video/quicktime",
            ".png" => "image/png",
            ".jpg" => "image/jpeg",
            ".jpeg" => "image/jpeg",
            ".svg" => "image/svg+xml",
            ".webp" => "image/webp",
            _ => MediaTypeNames.Application.Octet
        };

        var stream = new FileStream(fullPath, FileMode.Open, FileAccess.Read, FileShare.Read);
        return File(stream, contentType, enableRangeProcessing: true);
    }

    /// <summary>
    /// Gets plugin configuration status.
    /// </summary>
    [HttpGet("config")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public ActionResult<PluginStatus> GetConfig()
    {
        var config = Plugin.Instance?.Configuration;
        return Ok(new PluginStatus
        {
            Enabled = config?.EnableStudioRow ?? false,
            MaxStudios = config?.MaxStudios ?? 30,
            IntrosFolderExists = !string.IsNullOrEmpty(config?.IntroVideosPath) && Directory.Exists(config.IntroVideosPath),
            SelectedStudioNames = config?.SelectedStudioNames ?? "Netflix, Disney+, Apple TV+, Paramount+, Warner Bros."
        });
    }
}

/// <summary>
/// Studio intro information DTO.
/// </summary>
public class StudioIntroInfo
{
    public string StudioName { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
}

/// <summary>
/// Plugin status DTO.
/// </summary>
public class PluginStatus
{
    public bool Enabled { get; set; }
    public int MaxStudios { get; set; }
    public bool IntrosFolderExists { get; set; }
    public string SelectedStudioNames { get; set; } = string.Empty;
}
