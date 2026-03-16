{ pkgs, ... }: {

  channel = "stable-24.05";

  packages = [

    pkgs.git

    # Node / NextJS
    pkgs.nodejs_20
    pkgs.nodePackages.npm
    pkgs.nodePackages.pnpm

    # PHP / Laravel
    pkgs.php82
    pkgs.php82Packages.composer

    # Python / AI Engine
    pkgs.python311
    pkgs.python311Packages.pip

    # Database
    pkgs.postgresql_15

    # Cache
    pkgs.redis

    # CLI tools
    pkgs.curl
    pkgs.wget
    pkgs.unzip
  ];

  env = {
    APP_ENV = "local";
  };

  idx = {

    extensions = [
      "google.gemini-cli-vscode-ide-companion"
      "bmewburn.vscode-intelephense-client"
      "esbenp.prettier-vscode"
      "ms-python.python"
      "bradlc.vscode-tailwindcss"
    ];

    previews = {
      enable = true;
    };

    workspace = {

      onCreate = {

        init-git = ''
          git init
        '';

        default.openFiles = [
          ".idx/dev.nix"
          "README.md"
        ];

      };

      onStart = {

      };

    };

  };

}