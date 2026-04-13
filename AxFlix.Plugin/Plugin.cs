using System;
using System.Collections.Generic;
using System.Globalization;
using AxFlix.Plugin.Configuration;
using MediaBrowser.Common.Configuration;
using MediaBrowser.Common.Plugins;
using MediaBrowser.Model.Plugins;
using MediaBrowser.Model.Serialization;

namespace AxFlix.Plugin;

/// <summary>
/// AxFlix Plugin - Studio Showcase with Intro Videos.
/// </summary>
public class Plugin : BasePlugin<PluginConfiguration>, IHasWebPages
{
    public Plugin(IApplicationPaths applicationPaths, IXmlSerializer xmlSerializer)
        : base(applicationPaths, xmlSerializer)
    {
        Instance = this;
    }

    /// <inheritdoc />
    public override string Name => "AxFlix Studios";

    /// <inheritdoc />
    public override Guid Id => Guid.Parse("a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d");

    /// <inheritdoc />
    public override string Description => "Affiche une ligne de studios avec logos et vidéos d'intro au survol";

    /// <summary>
    /// Gets the current plugin instance.
    /// </summary>
    public static Plugin? Instance { get; private set; }

    /// <inheritdoc />
    public IEnumerable<PluginPageInfo> GetPages()
    {
        return new[]
        {
            new PluginPageInfo
            {
                Name = "axflixstudios",
                EmbeddedResourcePath = GetType().Namespace + ".Configuration.configPage.html"
            },
            new PluginPageInfo
            {
                Name = "axflix-studios.js",
                EmbeddedResourcePath = GetType().Namespace + ".Web.axflix-studios.js"
            },
            new PluginPageInfo
            {
                Name = "axflix-studios.css",
                EmbeddedResourcePath = GetType().Namespace + ".Web.axflix-studios.css"
            }
        };
    }
}
