using MediaBrowser.Model.Plugins;

namespace AxFlix.Plugin.Configuration;

/// <summary>
/// Plugin configuration for AxFlix Studios.
/// </summary>
public class PluginConfiguration : BasePluginConfiguration
{
    /// <summary>
    /// Gets or sets the path to the studio intro videos folder.
    /// </summary>
    public string IntroVideosPath { get; set; } = "/mnt/media/studio-intros";

    /// <summary>
    /// Gets or sets a value indicating whether the studio row is enabled.
    /// </summary>
    public bool EnableStudioRow { get; set; } = true;

    /// <summary>
    /// Gets or sets the maximum number of studios to display.
    /// </summary>
    public int MaxStudios { get; set; } = 30;

    /// <summary>
    /// Gets or sets the comma-separated list of selected studio names to display.
    /// </summary>
    public string SelectedStudioNames { get; set; } = "Netflix, Disney+, Apple TV+, Paramount+, Warner Bros.";
}
